import { apiRequest } from '@/shared/api/httpClient'
import { normalizeSession, type AuthSessionPayload } from '@/features/auth/model/normalizers'

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthSessionPayload>('/auth/login', {
      authenticated: false,
      method: 'POST',
      body: { email, password }
    }).then(normalizeSession)
  },

  register(email: string, name: string, password: string) {
    return apiRequest<AuthSessionPayload>('/auth/register', {
      authenticated: false,
      method: 'POST',
      body: { email, name, password }
    }).then(normalizeSession)
  }
}
