import type { BillingOverviewDTO, CheckoutSessionDTO, PlanCode, PlanDTO } from '@margem/types'
import { apiRequest } from '@/shared/api/httpClient'

type BillingPayload = Partial<BillingOverviewDTO> & {
  current_plan?: PlanCode
  plan_status?: BillingOverviewDTO['planStatus']
  activated_at?: string | null
  expires_at?: string | null
  pending_checkout?: CheckoutSessionDTO | null
}

function normalizeBilling(data: BillingPayload): BillingOverviewDTO {
  return {
    currentPlan: data.currentPlan ?? data.current_plan ?? 'FREE',
    planStatus: data.planStatus ?? data.plan_status ?? 'FREE',
    activatedAt: data.activatedAt ?? data.activated_at ?? null,
    expiresAt: data.expiresAt ?? data.expires_at ?? null,
    subscription: data.subscription ?? null,
    pendingCheckout: data.pendingCheckout ?? data.pending_checkout ?? null
  }
}

export const billingApi = {
  getPlans() {
    return apiRequest<PlanDTO[]>('/billing/plans', { authenticated: false })
  },

  async getOverview() {
    const payload = await apiRequest<BillingPayload>('/billing/subscription')
    return normalizeBilling(payload)
  },

  createCheckout(plan: PlanCode) {
    return apiRequest<CheckoutSessionDTO>('/billing/checkout', {
      method: 'POST',
      body: { plan }
    })
  }
}
