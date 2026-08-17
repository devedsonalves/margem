import prisma from '../lib/prisma'
import { cancelAsaasCheckout, listAsaasSubscriptions, removeAsaasSubscription } from './asaas'

export async function cancelUserBilling(userId: string) {
  const [user, localSubscriptions, checkoutSessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { current_plan: true, plan_status: true }
    }),
    prisma.billingSubscription.findMany({
      where: { user_id: userId, status: { not: 'CANCELED' } },
      select: { external_subscription_id: true }
    }),
    prisma.billingCheckoutSession.findMany({
      where: { user_id: userId },
      select: { external_id: true, external_reference: true, status: true }
    })
  ])

  if (!user) throw new Error('Conta não encontrada')

  const externalSubscriptionIds = new Set(
    localSubscriptions
      .map(subscription => subscription.external_subscription_id)
      .filter((id): id is string => Boolean(id) && !id!.startsWith('checkout:') && !id!.startsWith('payment:'))
  )

  for (const session of checkoutSessions) {
    const remoteSubscriptions = await listAsaasSubscriptions({
      externalReference: session.external_reference,
      limit: 100
    })
    remoteSubscriptions.forEach(subscription => {
      if (subscription.id) externalSubscriptionIds.add(subscription.id)
    })
  }

  for (const session of checkoutSessions) {
    if (session.status === 'CREATED') await cancelAsaasCheckout(session.external_id)
  }

  for (const subscriptionId of externalSubscriptionIds) {
    await removeAsaasSubscription(subscriptionId)
  }

  const canceledAt = new Date()
  await prisma.$transaction([
    prisma.billingSubscription.updateMany({
      where: { user_id: userId, status: { not: 'CANCELED' } },
      data: { status: 'CANCELED', canceled_at: canceledAt }
    }),
    prisma.billingCheckoutSession.updateMany({
      where: { user_id: userId, status: 'CREATED' },
      data: { status: 'CANCELED' }
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        current_plan: 'FREE',
        plan_status: 'FREE',
        plan_activated_at: null,
        plan_expires_at: null
      }
    })
  ])

  return {
    canceledRemoteSubscriptions: externalSubscriptionIds.size,
    previousPlan: user.current_plan,
    previousStatus: user.plan_status
  }
}
