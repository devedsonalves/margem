import { apiRequest } from '@/shared/api/httpClient'
import {
  normalizeSession,
  normalizeUser,
  type AuthSessionPayload,
  type AuthUserPayload
} from '@/features/auth/model/normalizers'
import type { AuthUser } from '@/features/auth/model/types'
import type { PasswordSettingsInput, ProfileSettingsInput } from '@/features/settings/model/types'

type ProfileResponse = {
  user?: AuthUserPayload | null
}

type MessageResponse = {
  message: string
}

function requireUser(payload: ProfileResponse): AuthUser {
  const user = normalizeUser(payload.user)
  if (!user) throw new Error('Resposta de perfil inválida')
  return user
}

export const settingsApi = {
  getProfile() {
    return apiRequest<ProfileResponse>('/auth/me').then(requireUser)
  },

  updateProfile(input: ProfileSettingsInput) {
    return apiRequest<AuthSessionPayload>('/auth/me', {
      method: 'PATCH',
      body: input
    }).then(normalizeSession)
  },

  updatePassword(input: PasswordSettingsInput) {
    return apiRequest<MessageResponse>('/auth/password', {
      method: 'PATCH',
      body: input
    })
  },

  cancelSubscription() {
    return apiRequest<MessageResponse>('/billing/subscription', {
      method: 'DELETE'
    })
  },

  exportData() {
    return apiRequest<unknown>('/auth/export')
  },

  deleteAccount(password: string) {
    return apiRequest<MessageResponse>('/auth/me', {
      method: 'DELETE',
      body: { password }
    })
  }
}
