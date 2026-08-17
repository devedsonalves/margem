const TOKEN_STORAGE_KEY = 'margem_token'

export function getAuthToken() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}
