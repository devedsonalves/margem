import type { BillingOverviewDTO, PlanCode } from '@margem/types'
import type { AuthSession, AuthUser } from '@/features/auth/model/types'

export type AuthUserPayload = Partial<AuthUser> & {
  created_at?: string
  current_plan?: string
  plan_status?: string
}

export type AuthSessionPayload = {
  token?: string
  user?: AuthUserPayload | null
}

const planCodes: PlanCode[] = ['FREE', 'ESSENTIAL', 'PREMIUM']
const planStatuses: BillingOverviewDTO['planStatus'][] = ['FREE', 'PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED']

export function normalizeUser(user: AuthUserPayload | null | undefined): AuthUser | null {
  if (!user?.id || !user.email) return null

  const rawPlan = user.currentPlan ?? user.current_plan
  const rawStatus = user.planStatus ?? user.plan_status

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    createdAt: user.createdAt ?? user.created_at,
    currentPlan: planCodes.find(plan => plan === rawPlan) ?? 'FREE',
    planStatus: planStatuses.find(status => status === rawStatus) ?? 'FREE'
  }
}

export function normalizeSession(payload: AuthSessionPayload): AuthSession {
  if (!payload.token) throw new Error('Resposta de autenticação inválida')
  return { token: payload.token, user: normalizeUser(payload.user) }
}
