import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  BillingCheckoutSession,
  BillingSubscription,
  BillingSubscriptionStatus,
  BillingWebhookEvent,
  CheckoutStatus,
  PlanCode,
  PlanStatus,
  User
} from '@margem/database'
import { DataSource, Repository } from 'typeorm'
import {
  cancelAsaasCheckout,
  createRecurringCheckout,
  listAsaasSubscriptions,
  removeAsaasSubscription,
  validateAsaasWebhookToken
} from '../../infrastructure/integrations/asaas/asaas.adapter'
import { getPaidPlan, plans, serializePlan } from './domain/plans'

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(BillingCheckoutSession) private readonly sessions: Repository<BillingCheckoutSession>,
    @InjectRepository(BillingSubscription) private readonly subscriptions: Repository<BillingSubscription>,
    @InjectRepository(BillingWebhookEvent) private readonly events: Repository<BillingWebhookEvent>,
    private readonly dataSource: DataSource
  ) {}
  plans() {
    return plans.map(serializePlan)
  }
  async overview(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { billingSubscriptions: true, billingCheckoutSessions: true },
      order: { billingSubscriptions: { created_at: 'DESC' }, billingCheckoutSessions: { created_at: 'DESC' } }
    })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    const subscription = user.billingSubscriptions[0]
    const pending =
      user.plan_status === PlanStatus.PENDING
        ? user.billingCheckoutSessions.find(item => item.status === CheckoutStatus.CREATED)
        : undefined
    return {
      currentPlan: user.current_plan,
      planStatus: user.plan_status,
      activatedAt: user.plan_activated_at?.toISOString() || null,
      expiresAt: user.plan_expires_at?.toISOString() || null,
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            activatedAt: subscription.activated_at?.toISOString() || null,
            currentPeriodEnd: subscription.current_period_end?.toISOString() || null,
            externalSubscriptionId: subscription.external_subscription_id
          }
        : null,
      pendingCheckout: pending
        ? { id: pending.id, plan: pending.plan, checkoutUrl: pending.checkout_url, status: pending.status }
        : null
    }
  }
  async checkout(userId: string, code: unknown) {
    const plan = getPaidPlan(code)
    if (!plan) throw new BadRequestException('Plano inválido para checkout')
    const user = await this.users.findOneBy({ id: userId })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    if (user.current_plan === plan.code && user.plan_status === PlanStatus.ACTIVE)
      throw new BadRequestException('Este plano já está ativo')
    try {
      const checkout = await createRecurringCheckout({ plan, user })
      return await this.dataSource.transaction(async manager => {
        const session = await manager.save(
          BillingCheckoutSession,
          manager.create(BillingCheckoutSession, {
            user_id: user.id,
            plan: plan.code,
            external_id: checkout.asaasId,
            external_reference: checkout.externalReference,
            checkout_url: checkout.checkoutUrl,
            amount_cents: plan.priceCents,
            raw_response: checkout.raw
          })
        )
        user.current_plan = plan.code
        user.plan_status = PlanStatus.PENDING
        await manager.save(User, user)
        return { id: session.id, plan: session.plan, checkoutUrl: session.checkout_url, status: session.status }
      })
    } catch (error) {
      throw new BadGatewayException(
        error instanceof Error ? error.message : 'Não foi possível criar o checkout no Asaas'
      )
    }
  }
  async cancel(userId: string) {
    const user = await this.users.findOneBy({ id: userId })
    if (!user) throw new NotFoundException('Conta não encontrada')
    const sessions = await this.sessions.findBy({ user_id: userId })
    const subscriptions = await this.subscriptions.findBy({ user_id: userId })
    try {
      for (const session of sessions) {
        if (session.status === CheckoutStatus.CREATED) await cancelAsaasCheckout(session.external_id)
        const remote = await listAsaasSubscriptions({ externalReference: session.external_reference, limit: 100 })
        for (const item of remote) if (item.id) await removeAsaasSubscription(item.id)
      }
      for (const item of subscriptions)
        if (item.external_subscription_id && !item.external_subscription_id.includes(':'))
          await removeAsaasSubscription(item.external_subscription_id)
    } catch (error) {
      throw new BadGatewayException(error instanceof Error ? error.message : 'Não foi possível cancelar a assinatura')
    }
    await this.dataSource.transaction(async manager => {
      await manager.update(
        BillingSubscription,
        { user_id: userId },
        { status: BillingSubscriptionStatus.CANCELED, canceled_at: new Date() }
      )
      await manager.update(
        BillingCheckoutSession,
        { user_id: userId, status: CheckoutStatus.CREATED },
        { status: CheckoutStatus.CANCELED }
      )
      await manager.update(
        User,
        { id: userId },
        { current_plan: PlanCode.FREE, plan_status: PlanStatus.FREE, plan_activated_at: null, plan_expires_at: null }
      )
    })
    return { message: 'Assinatura cancelada com sucesso' }
  }
  async webhook(token: string | undefined, payload: Record<string, unknown>) {
    if (!validateAsaasWebhookToken(token)) throw new UnauthorizedException('Token inválido')
    const externalId = text(payload.id)
    if (!externalId) throw new BadRequestException('Evento sem id')
    const existing = await this.events.findOneBy({ external_id: externalId })
    const retryable = existing && !existing.processed_at && Date.now() - existing.created_at.getTime() > 300_000
    if (existing && !retryable) return { received: true, duplicate: true }
    const event =
      existing ||
      this.events.create({
        external_id: externalId,
        event_name: text(payload.event) || 'UNKNOWN',
        payment_id: nestedText(payload.payment, 'id') || nestedText(payload.checkout, 'id') || null,
        subscription_id: nestedText(payload.payment, 'subscription') || nestedText(payload.subscription, 'id') || null,
        raw_payload: payload
      })
    if (!existing) {
      const inserted: Array<{ id: string }> = await this.dataSource.query(
        `INSERT INTO "BillingWebhookEvent" ("id", "provider", "external_id", "event_name", "payment_id", "subscription_id", "raw_payload") VALUES ($1, 'ASAAS', $2, $3, $4, $5, $6) ON CONFLICT ("external_id") DO NOTHING RETURNING "id"`,
        [event.id, event.external_id, event.event_name, event.payment_id, event.subscription_id, event.raw_payload]
      )
      if (inserted.length === 0) return { received: true, duplicate: true }
    }
    await this.processEvent(event.event_name, payload)
    event.processed_at = new Date()
    await this.events.save(event)
    return { received: true }
  }
  private async processEvent(name: string, payload: Record<string, unknown>) {
    const checkoutId = nestedText(payload.checkout, 'id') || nestedText(payload.payment, 'checkoutSession')
    const reference =
      nestedText(payload.payment, 'externalReference') || nestedText(payload.subscription, 'externalReference')
    const session = checkoutId
      ? await this.sessions.findOneBy({ external_id: checkoutId })
      : reference
        ? await this.sessions.findOneBy({ external_reference: reference })
        : null
    if (!session) return
    if (['CHECKOUT_PAID', 'PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(name)) {
      await this.activate(
        session,
        nestedText(payload.payment, 'subscription') || `checkout:${session.external_id}`,
        nestedText(payload.payment, 'id')
      )
      return
    }
    if (name === 'PAYMENT_OVERDUE') {
      await this.users.update(session.user_id, { plan_status: PlanStatus.PAST_DUE })
      return
    }
    if (
      [
        'CHECKOUT_CANCELED',
        'CHECKOUT_EXPIRED',
        'PAYMENT_DELETED',
        'PAYMENT_REFUNDED',
        'SUBSCRIPTION_DELETED',
        'SUBSCRIPTION_INACTIVATED'
      ].includes(name)
    )
      await this.dataSource.transaction(async manager => {
        await manager.update(BillingCheckoutSession, session.id, {
          status: name === 'CHECKOUT_EXPIRED' ? CheckoutStatus.EXPIRED : CheckoutStatus.CANCELED
        })
        await manager.update(User, session.user_id, { current_plan: PlanCode.FREE, plan_status: PlanStatus.CANCELED })
      })
  }
  private async activate(session: BillingCheckoutSession, externalId: string, paymentId?: string) {
    const start = new Date()
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    await this.dataSource.transaction(async manager => {
      let subscription = await manager.findOneBy(BillingSubscription, { external_subscription_id: externalId })
      subscription = manager.create(BillingSubscription, {
        ...subscription,
        user_id: session.user_id,
        plan: session.plan,
        status: BillingSubscriptionStatus.ACTIVE,
        external_subscription_id: externalId,
        latest_payment_id: paymentId || null,
        latest_checkout_id: session.external_id,
        current_period_start: start,
        current_period_end: end,
        activated_at: start
      })
      await manager.save(subscription)
      await manager.update(User, session.user_id, {
        current_plan: session.plan,
        plan_status: PlanStatus.ACTIVE,
        plan_activated_at: start,
        plan_expires_at: end
      })
      await manager.update(BillingCheckoutSession, session.id, { status: CheckoutStatus.PAID })
    })
  }
}
const text = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value : undefined)
const nestedText = (value: unknown, key: string): string | undefined =>
  typeof value === 'object' && value !== null ? text((value as Record<string, unknown>)[key]) : undefined
