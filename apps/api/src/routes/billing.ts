import { Router, Response } from 'express'
import { BillingSubscriptionStatus, PlanCode, PlanStatus, Prisma } from '@margem/database'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import {
  AsaasPayment,
  AsaasSubscription,
  createRecurringCheckout,
  listAsaasPayments,
  listAsaasSubscriptions,
  validateAsaasWebhookToken
} from '../services/asaas'
import { getPaidPlan, plans, serializePlan } from '../services/plans'
import { cancelUserBilling } from '../services/billingCancellation'

const router = Router()

router.get('/plans', async (_req, res) => {
  res.json(plans.map(serializePlan))
})

router.get('/subscription', authMiddleware, async (req: AuthRequest, res: Response) => {
  await reconcilePendingBillingForUser(req.user!.id).catch(error => {
    console.error('Failed to reconcile pending billing:', error instanceof Error ? error.message : error)
  })

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      billingSubscriptions: {
        orderBy: { created_at: 'desc' },
        take: 1
      },
      billingCheckoutSessions: {
        where: { status: 'CREATED' },
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  })

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  res.json(serializeBillingOverview(user))
})

router.delete('/subscription', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await cancelUserBilling(req.user!.id)
    return res.json({ message: 'Assinatura cancelada com sucesso' })
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Não foi possível cancelar a assinatura'
    })
  }
})

router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  const plan = getPaidPlan(req.body.plan)
  if (!plan) return res.status(400).json({ error: 'Plano inválido para checkout' })

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, current_plan: true, plan_status: true }
  })

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  if (user.current_plan === plan.code && user.plan_status === 'ACTIVE') {
    return res.status(400).json({ error: 'Este plano já está ativo' })
  }

  try {
    const checkout = await createRecurringCheckout({ plan, user })
    const session = await prisma.billingCheckoutSession.create({
      data: {
        user_id: user.id,
        plan: plan.code,
        external_id: checkout.asaasId,
        external_reference: checkout.externalReference,
        checkout_url: checkout.checkoutUrl,
        amount_cents: plan.priceCents,
        raw_response: checkout.raw as Prisma.InputJsonValue
      }
    })

    await prisma.user.update({
      where: { id: user.id },
      data: {
        current_plan: plan.code,
        plan_status: 'PENDING'
      }
    })

    res.json({
      id: session.id,
      plan: session.plan,
      checkoutUrl: session.checkout_url,
      status: session.status
    })
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Não foi possível criar o checkout no Asaas'
    })
  }
})

router.get('/checkout-return', (req, res) => {
  const frontendUrl = (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
  const status = typeof req.query.status === 'string' ? req.query.status : 'success'

  res.redirect(`${frontendUrl}/planos/retorno?status=${encodeURIComponent(status)}`)
})

router.post('/webhooks/asaas', async (req, res) => {
  const receivedToken = req.header('asaas-access-token')
  if (!validateAsaasWebhookToken(receivedToken)) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const eventId = typeof req.body.id === 'string' ? req.body.id : null
  const eventName = typeof req.body.event === 'string' ? req.body.event : 'UNKNOWN'
  const payment = isRecord(req.body.payment) ? req.body.payment : null
  const checkout = isRecord(req.body.checkout) ? req.body.checkout : null
  const subscription = isRecord(req.body.subscription) ? req.body.subscription : null

  if (!eventId) return res.status(400).json({ error: 'Evento sem id' })

  const existingEvent = await prisma.billingWebhookEvent.findUnique({ where: { external_id: eventId } })
  if (existingEvent?.processed_at) return res.json({ received: true, duplicate: true })

  const webhookEvent =
    existingEvent ||
    (await prisma.billingWebhookEvent.create({
      data: {
        external_id: eventId,
        event_name: eventName,
        payment_id: getString(payment?.id) || getString(checkout?.id),
        subscription_id: getString(payment?.subscription) || getString(subscription?.id),
        raw_payload: req.body as Prisma.InputJsonValue
      }
    }))

  await processAsaasSubscriptionEvent(eventName, subscription)
  await processAsaasPaymentEvent(eventName, payment)
  await processAsaasCheckoutEvent(eventName, checkout)

  await prisma.billingWebhookEvent.update({
    where: { id: webhookEvent.id },
    data: { processed_at: new Date() }
  })

  return res.json({ received: true })
})

async function processAsaasPaymentEvent(eventName: string, payment: Record<string, unknown> | null) {
  if (!payment) return

  const subscriptionId = getString(payment.subscription)
  const externalReference = getString(payment.externalReference)
  const checkoutSessionId = getString(payment.checkoutSession)
  const paymentId = getString(payment.id)
  const customerId = getString(payment.customer)

  const session =
    (externalReference
      ? await prisma.billingCheckoutSession.findUnique({ where: { external_reference: externalReference } })
      : null) ||
    (checkoutSessionId
      ? await prisma.billingCheckoutSession.findUnique({ where: { external_id: checkoutSessionId } })
      : null)

  const existingSubscription = subscriptionId
    ? await prisma.billingSubscription.findUnique({ where: { external_subscription_id: subscriptionId } })
    : null

  if (!session && !existingSubscription) return

  if (eventName === 'PAYMENT_CONFIRMED' || eventName === 'PAYMENT_RECEIVED') {
    const plan = session?.plan || existingSubscription?.plan
    const userId = session?.user_id || existingSubscription?.user_id
    if (!plan || !userId) return

    await activateBilling({
      userId,
      plan,
      externalSubscriptionId: subscriptionId || `payment:${paymentId}`,
      externalCustomerId: customerId,
      paymentId,
      checkoutId: session?.external_id,
      sessionId: session?.id
    })
    return
  }

  if (eventName === 'PAYMENT_OVERDUE') {
    await updateLocalStatus(session, existingSubscription, 'PAST_DUE', 'PAST_DUE')
    return
  }

  if (
    eventName === 'PAYMENT_DELETED' ||
    eventName === 'PAYMENT_REFUNDED' ||
    eventName === 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED'
  ) {
    await updateLocalStatus(session, existingSubscription, 'CANCELED', 'CANCELED')
  }
}

async function processAsaasSubscriptionEvent(eventName: string, subscription: Record<string, unknown> | null) {
  if (!subscription) return

  const subscriptionId = getString(subscription.id)
  if (!subscriptionId) return

  const externalReference = getString(subscription.externalReference)
  const customerId = getString(subscription.customer)
  const session = externalReference
    ? await prisma.billingCheckoutSession.findUnique({ where: { external_reference: externalReference } })
    : null
  const existingSubscription = await prisma.billingSubscription.findUnique({
    where: { external_subscription_id: subscriptionId }
  })

  if (eventName === 'SUBSCRIPTION_CREATED' || eventName === 'SUBSCRIPTION_UPDATED') {
    const plan = session?.plan || existingSubscription?.plan
    const userId = session?.user_id || existingSubscription?.user_id
    if (!plan || !userId) return

    await prisma.billingSubscription.upsert({
      where: { external_subscription_id: subscriptionId },
      update: {
        plan,
        external_customer_id: customerId,
        latest_checkout_id: session?.external_id
      },
      create: {
        user_id: userId,
        plan,
        status: 'PENDING',
        external_subscription_id: subscriptionId,
        external_customer_id: customerId,
        latest_checkout_id: session?.external_id
      }
    })
    return
  }

  if (eventName === 'SUBSCRIPTION_INACTIVATED' || eventName === 'SUBSCRIPTION_DELETED') {
    await updateLocalStatus(session, existingSubscription, 'CANCELED', 'CANCELED')
  }
}

async function processAsaasCheckoutEvent(eventName: string, checkout: Record<string, unknown> | null) {
  if (!checkout) return

  const checkoutId = getString(checkout.id)
  if (!checkoutId) return

  const session = await prisma.billingCheckoutSession.findUnique({
    where: { external_id: checkoutId }
  })

  if (!session) return

  if (eventName === 'CHECKOUT_PAID') {
    const periodStart = new Date()
    const periodEnd = addMonths(periodStart, 1)

    await prisma.$transaction([
      prisma.billingSubscription.upsert({
        where: { external_subscription_id: `checkout:${checkoutId}` },
        update: {
          status: 'ACTIVE',
          plan: session.plan,
          latest_checkout_id: checkoutId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          activated_at: periodStart
        },
        create: {
          user_id: session.user_id,
          plan: session.plan,
          status: 'ACTIVE',
          external_subscription_id: `checkout:${checkoutId}`,
          latest_checkout_id: checkoutId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          activated_at: periodStart
        }
      }),
      prisma.user.update({
        where: { id: session.user_id },
        data: {
          current_plan: session.plan,
          plan_status: 'ACTIVE',
          plan_activated_at: periodStart,
          plan_expires_at: periodEnd
        }
      }),
      prisma.billingCheckoutSession.update({
        where: { id: session.id },
        data: { status: 'PAID' }
      })
    ])
    return
  }

  if (eventName === 'CHECKOUT_CANCELED' || eventName === 'CHECKOUT_EXPIRED') {
    await prisma.billingCheckoutSession.update({
      where: { id: session.id },
      data: { status: eventName === 'CHECKOUT_EXPIRED' ? 'EXPIRED' : 'CANCELED' }
    })
  }
}

async function reconcilePendingBillingForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan_status: true }
  })
  if (user?.plan_status !== 'PENDING') return

  const session = await prisma.billingCheckoutSession.findFirst({
    where: { user_id: userId, status: 'CREATED' },
    orderBy: { created_at: 'desc' }
  })
  if (!session) return

  const paymentsByReference = await listAsaasPayments({
    externalReference: session.external_reference,
    limit: 10
  })
  const paidByReference = findPaidAsaasPayment(paymentsByReference)
  if (paidByReference) {
    await activateBillingFromAsaasPayment(session, paidByReference)
    return
  }

  const paymentsByCheckout = await listAsaasPayments({
    checkoutSession: session.external_id,
    limit: 100
  })
  const paidByCheckout = findPaidAsaasPayment(paymentsByCheckout)
  if (paidByCheckout) {
    await activateBillingFromAsaasPayment(session, paidByCheckout)
    return
  }

  const subscriptions = await listAsaasSubscriptions({
    externalReference: session.external_reference,
    limit: 10
  })

  for (const subscription of subscriptions) {
    if (!subscription.id) continue
    await ensureLocalSubscriptionFromAsaas(session, subscription)
    const payments = await listAsaasPayments({ subscription: subscription.id, limit: 10 })
    const paidPayment = findPaidAsaasPayment(payments)
    if (paidPayment) {
      await activateBillingFromAsaasPayment(session, paidPayment, subscription)
      return
    }
  }
}

async function ensureLocalSubscriptionFromAsaas(
  session: { user_id: string; plan: PlanCode; external_id: string },
  subscription: AsaasSubscription
) {
  await prisma.billingSubscription.upsert({
    where: { external_subscription_id: subscription.id },
    update: {
      plan: session.plan,
      external_customer_id: getString(subscription.customer),
      latest_checkout_id: session.external_id
    },
    create: {
      user_id: session.user_id,
      plan: session.plan,
      status: 'PENDING',
      external_subscription_id: subscription.id,
      external_customer_id: getString(subscription.customer),
      latest_checkout_id: session.external_id
    }
  })
}

function findPaidAsaasPayment(payments: AsaasPayment[]) {
  return payments.find(payment => payment.status === 'CONFIRMED' || payment.status === 'RECEIVED')
}

async function activateBillingFromAsaasPayment(
  session: { id: string; user_id: string; plan: PlanCode; external_id: string },
  payment: AsaasPayment,
  subscription?: AsaasSubscription
) {
  await activateBilling({
    userId: session.user_id,
    plan: session.plan,
    externalSubscriptionId: payment.subscription || subscription?.id || `payment:${payment.id}`,
    externalCustomerId: payment.customer || subscription?.customer,
    paymentId: payment.id,
    checkoutId: session.external_id,
    sessionId: session.id
  })
}

async function activateBilling(input: {
  userId: string
  plan: PlanCode
  externalSubscriptionId: string
  externalCustomerId?: string
  paymentId?: string
  checkoutId?: string
  sessionId?: string
}) {
  const periodStart = new Date()
  const periodEnd = addMonths(periodStart, 1)

  await prisma.$transaction([
    prisma.billingSubscription.upsert({
      where: { external_subscription_id: input.externalSubscriptionId },
      update: {
        status: 'ACTIVE',
        plan: input.plan,
        external_customer_id: input.externalCustomerId,
        latest_payment_id: input.paymentId,
        latest_checkout_id: input.checkoutId,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        activated_at: periodStart
      },
      create: {
        user_id: input.userId,
        plan: input.plan,
        status: 'ACTIVE',
        external_subscription_id: input.externalSubscriptionId,
        external_customer_id: input.externalCustomerId,
        latest_payment_id: input.paymentId,
        latest_checkout_id: input.checkoutId,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        activated_at: periodStart
      }
    }),
    prisma.user.update({
      where: { id: input.userId },
      data: {
        current_plan: input.plan,
        plan_status: 'ACTIVE',
        plan_activated_at: periodStart,
        plan_expires_at: periodEnd
      }
    }),
    ...(input.sessionId
      ? [
          prisma.billingCheckoutSession.update({
            where: { id: input.sessionId },
            data: { status: 'PAID' }
          })
        ]
      : [])
  ])
}

async function updateLocalStatus(
  session: { user_id: string; plan: PlanCode; id: string } | null,
  subscription: { user_id: string; id: string } | null,
  planStatus: PlanStatus,
  subscriptionStatus: BillingSubscriptionStatus
) {
  const userId = session?.user_id || subscription?.user_id
  if (!userId) return

  const updates: Prisma.PrismaPromise<unknown>[] = [
    prisma.user.update({
      where: { id: userId },
      data: {
        plan_status: planStatus,
        ...(planStatus === 'CANCELED' ? { current_plan: 'FREE', plan_expires_at: new Date() } : {})
      }
    })
  ]

  if (subscription) {
    updates.push(
      prisma.billingSubscription.update({
        where: { id: subscription.id },
        data: {
          status: subscriptionStatus,
          ...(subscriptionStatus === 'CANCELED' ? { canceled_at: new Date() } : {})
        }
      })
    )
  }

  if (session && planStatus === 'CANCELED') {
    updates.push(
      prisma.billingCheckoutSession.update({
        where: { id: session.id },
        data: { status: 'CANCELED' }
      })
    )
  }

  await prisma.$transaction(updates)
}

function serializeBillingOverview(user: {
  current_plan: PlanCode
  plan_status: PlanStatus
  plan_activated_at: Date | null
  plan_expires_at: Date | null
  billingSubscriptions: Array<{
    id: string
    plan: PlanCode
    status: BillingSubscriptionStatus
    activated_at: Date | null
    current_period_end: Date | null
    external_subscription_id: string | null
  }>
  billingCheckoutSessions: Array<{
    id: string
    plan: PlanCode
    status: 'CREATED' | 'PAID' | 'EXPIRED' | 'CANCELED'
    checkout_url: string
  }>
}) {
  const latestSubscription = user.billingSubscriptions[0]
  const pendingCheckout = user.plan_status === 'PENDING' ? user.billingCheckoutSessions[0] : null

  return {
    currentPlan: user.current_plan,
    planStatus: user.plan_status,
    activatedAt: user.plan_activated_at?.toISOString() || null,
    expiresAt: user.plan_expires_at?.toISOString() || null,
    subscription: latestSubscription
      ? {
          id: latestSubscription.id,
          plan: latestSubscription.plan,
          status: latestSubscription.status,
          activatedAt: latestSubscription.activated_at?.toISOString() || null,
          currentPeriodEnd: latestSubscription.current_period_end?.toISOString() || null,
          externalSubscriptionId: latestSubscription.external_subscription_id
        }
      : null,
    pendingCheckout: pendingCheckout
      ? {
          id: pendingCheckout.id,
          plan: pendingCheckout.plan,
          checkoutUrl: pendingCheckout.checkout_url,
          status: pendingCheckout.status
        }
      : null
  }
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function addMonths(date: Date, amount: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + amount)
  return nextDate
}

export default router
