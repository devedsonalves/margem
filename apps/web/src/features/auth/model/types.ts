import type { BillingOverviewDTO, PlanCode } from '@margem/types'

export type AuthUser = {
  id: string
  email: string
  name: string
  currentPlan?: PlanCode
  planStatus?: BillingOverviewDTO['planStatus']
  createdAt?: string
}

export type AuthSession = {
  user: AuthUser | null
  token: string
}
