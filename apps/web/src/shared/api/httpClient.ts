import { getAuthToken } from '@/shared/api/authToken'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type RequestBody = BodyInit | Record<string, unknown> | undefined

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  authenticated?: boolean
  body?: RequestBody
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function serializeBody(body: RequestBody, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined
  if (typeof body === 'string') return body
  if (body instanceof FormData) return body

  headers.set('Content-Type', 'application/json')
  return JSON.stringify(body)
}

async function parsePayload(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function getErrorMessage(payload: unknown) {
  if (typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string') {
    return payload.error
  }

  return 'Falha na comunicação com o servidor'
}

export async function apiRequest<T>(
  path: string,
  { authenticated = true, body, headers: initialHeaders, ...init }: ApiRequestOptions = {}
): Promise<T> {
  const headers = new Headers(initialHeaders)

  if (authenticated) {
    const token = getAuthToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    body: serializeBody(body, headers)
  })
  const payload = await parsePayload(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status)
  }

  return payload as T
}
