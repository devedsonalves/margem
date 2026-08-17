import { clearAuthToken, getAuthToken, setAuthToken } from '@/shared/api/authToken'
import type { AuthSession, AuthUser } from '@/features/auth/model/types'

const USER_STORAGE_KEY = 'margem_user'

function readStoredUser(): AuthUser | null {
  const serializedUser = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!serializedUser) return null

  try {
    const value: unknown = JSON.parse(serializedUser)
    if (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof value.id === 'string' &&
      'email' in value &&
      typeof value.email === 'string' &&
      'name' in value &&
      typeof value.name === 'string'
    ) {
      return value as AuthUser
    }

    window.localStorage.removeItem(USER_STORAGE_KEY)
    return null
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export const sessionStore = {
  read(): AuthSession | null {
    if (typeof window === 'undefined') return null

    const token = getAuthToken()
    return token ? { token, user: readStoredUser() } : null
  },

  save(session: AuthSession) {
    setAuthToken(session.token)
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user))
  },

  clear() {
    clearAuthToken()
    window.localStorage.removeItem(USER_STORAGE_KEY)
  }
}
