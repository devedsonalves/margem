import { randomUUID } from 'crypto'
import { PlanDefinition } from './plans'

const sandboxBaseUrl = 'https://api-sandbox.asaas.com/v3'
const productionBaseUrl = 'https://api.asaas.com/v3'

type AsaasCheckoutResponse = {
  id: string
  link?: string
  [key: string]: unknown
}

export type AsaasPayment = {
  id: string
  status?: string
  externalReference?: string
  subscription?: string
  checkoutSession?: string
  customer?: string
  [key: string]: unknown
}

export type AsaasSubscription = {
  id: string
  status?: string
  externalReference?: string
  customer?: string
  [key: string]: unknown
}

type AsaasWebhook = {
  id: string
  name?: string
  url?: string
  enabled?: boolean
  interrupted?: boolean
  events?: string[]
}

type AsaasWebhookListResponse = {
  data?: AsaasWebhook[]
}

type AsaasListResponse<T> = {
  data?: T[]
}

type CreateCheckoutInput = {
  plan: PlanDefinition
  user: {
    id: string
    email: string
    name: string | null
  }
}

const billingWebhookEvents = [
  'CHECKOUT_PAID',
  'CHECKOUT_CANCELED',
  'CHECKOUT_EXPIRED',
  'SUBSCRIPTION_CREATED',
  'SUBSCRIPTION_UPDATED',
  'SUBSCRIPTION_INACTIVATED',
  'SUBSCRIPTION_DELETED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_REFUNDED',
  'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED'
]

function getBaseUrl() {
  const explicitUrl = process.env.ASAAS_API_URL?.trim()
  if (explicitUrl) return explicitUrl.replace(/\/$/, '')

  return process.env.ASAAS_ENVIRONMENT === 'production' ? productionBaseUrl : sandboxBaseUrl
}

function getFrontendUrl() {
  return (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function getCheckoutReturnBaseUrl() {
  return (
    process.env.ASAAS_CHECKOUT_RETURN_BASE_URL ||
    process.env.ASAAS_CALLBACK_BASE_URL ||
    process.env.PUBLIC_API_URL ||
    process.env.API_URL ||
    getFrontendUrl()
  ).replace(/\/$/, '')
}

function getWebhookBaseUrl() {
  return (
    process.env.ASAAS_WEBHOOK_BASE_URL ||
    process.env.ASAAS_CALLBACK_BASE_URL ||
    process.env.PUBLIC_API_URL ||
    process.env.API_URL ||
    ''
  ).replace(/\/$/, '')
}

function getApiKey() {
  const apiKey = process.env.ASAAS_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY is not configured')
  }
  return apiKey
}

function getWebhookToken() {
  return process.env.ASAAS_WEBHOOK_TOKEN?.trim()
}

async function requestAsaas<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Margem MVP',
      access_token: getApiKey(),
      ...(init.headers || {})
    }
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = extractAsaasError(data) || 'Falha na comunicação com o Asaas'
    throw new AsaasRequestError(message, response.status)
  }

  return data as T
}

class AsaasRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'AsaasRequestError'
  }
}

export async function ensureAsaasBillingWebhook() {
  if (process.env.ASAAS_AUTO_CONFIGURE_WEBHOOK === 'false') return

  const baseUrl = getWebhookBaseUrl()
  if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    console.warn('Asaas webhook auto-config skipped: configure ASAAS_CALLBACK_BASE_URL with a public URL.')
    return
  }

  const authToken = getWebhookToken()
  if (!authToken) {
    console.warn('Asaas webhook auto-config skipped: configure ASAAS_WEBHOOK_TOKEN.')
    return
  }

  const url = `${baseUrl}/billing/webhooks/asaas`
  const payload = {
    name: 'Margem Billing',
    url,
    email: process.env.ASAAS_WEBHOOK_EMAIL || 'dev@margem.app',
    enabled: true,
    interrupted: false,
    apiVersion: 3,
    authToken,
    sendType: 'SEQUENTIALLY',
    events: billingWebhookEvents
  }

  const webhooks = await requestAsaas<AsaasWebhookListResponse>('/webhooks?offset=0&limit=100', {
    method: 'GET'
  })

  const existingWebhook = webhooks.data?.find(webhook => webhook.url === url || webhook.name === payload.name)

  if (existingWebhook?.id) {
    await requestAsaas(`/webhooks/${existingWebhook.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    console.log(`Asaas billing webhook updated: ${url}`)
    return
  }

  await requestAsaas('/webhooks', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  console.log(`Asaas billing webhook created: ${url}`)
}

export async function createRecurringCheckout(input: CreateCheckoutInput) {
  const externalReference = `margem:${input.user.id}:${input.plan.code}:${randomUUID()}`
  const checkoutReturnBaseUrl = getCheckoutReturnBaseUrl()
  const nextDueDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const response = await requestAsaas<AsaasCheckoutResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      billingTypes: getBillingTypes(),
      chargeTypes: ['RECURRENT'],
      minutesToExpire: Number(process.env.ASAAS_CHECKOUT_MINUTES_TO_EXPIRE || 120),
      externalReference,
      callback: {
        successUrl: `${checkoutReturnBaseUrl}/billing/checkout-return?status=success`,
        cancelUrl: `${checkoutReturnBaseUrl}/billing/checkout-return?status=cancel`,
        expiredUrl: `${checkoutReturnBaseUrl}/billing/checkout-return?status=expired`
      },
      items: [
        {
          name: `Margem ${input.plan.name}`,
          description: input.plan.description,
          quantity: 1,
          value: input.plan.priceCents / 100
        }
      ],
      subscription: {
        cycle: 'MONTHLY',
        nextDueDate
      }
    })
  })

  return {
    asaasId: response.id,
    checkoutUrl: response.link || buildCheckoutUrl(response.id),
    externalReference,
    raw: response
  }
}

export async function listAsaasPayments(filters: {
  externalReference?: string
  subscription?: string
  checkoutSession?: string
  limit?: number
}) {
  const params = new URLSearchParams()
  if (filters.externalReference) params.set('externalReference', filters.externalReference)
  if (filters.subscription) params.set('subscription', filters.subscription)
  params.set('limit', String(filters.limit || 20))

  const response = await requestAsaas<AsaasListResponse<AsaasPayment>>(`/payments?${params}`, {
    method: 'GET'
  })

  const payments = response.data || []
  if (filters.checkoutSession) {
    return payments.filter(payment => payment.checkoutSession === filters.checkoutSession)
  }

  return payments
}

export async function listAsaasSubscriptions(filters: { externalReference?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (filters.externalReference) params.set('externalReference', filters.externalReference)
  params.set('limit', String(filters.limit || 20))

  const response = await requestAsaas<AsaasListResponse<AsaasSubscription>>(`/subscriptions?${params}`, {
    method: 'GET'
  })

  return response.data || []
}

export async function removeAsaasSubscription(id: string) {
  try {
    await requestAsaas(`/subscriptions/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  } catch (error) {
    if (error instanceof AsaasRequestError && error.status === 404) return false
    throw error
  }
}

export async function cancelAsaasCheckout(id: string) {
  try {
    await requestAsaas(`/checkouts/${encodeURIComponent(id)}/cancel`, { method: 'POST' })
    return true
  } catch (error) {
    if (error instanceof AsaasRequestError && (error.status === 400 || error.status === 404)) return false
    throw error
  }
}

export function validateAsaasWebhookToken(receivedToken: string | undefined) {
  const expectedToken = getWebhookToken()
  if (!expectedToken) return true
  return receivedToken === expectedToken
}

function buildCheckoutUrl(id: string) {
  const checkoutBaseUrl =
    process.env.ASAAS_CHECKOUT_URL ||
    (process.env.ASAAS_ENVIRONMENT === 'production'
      ? 'https://asaas.com/checkoutSession/show'
      : 'https://sandbox.asaas.com/checkoutSession/show')

  return `${checkoutBaseUrl}?id=${encodeURIComponent(id)}`
}

function getBillingTypes() {
  const configured = process.env.ASAAS_BILLING_TYPES?.split(',')
    .map(item => item.trim())
    .filter(Boolean)

  return configured?.length ? configured : ['CREDIT_CARD']
}

function extractAsaasError(data: unknown) {
  if (!data || typeof data !== 'object') return null
  const errors = (data as { errors?: unknown }).errors
  if (!Array.isArray(errors)) return null

  return errors
    .map(error => {
      if (!error || typeof error !== 'object') return null
      return (error as { description?: unknown }).description
    })
    .filter((description): description is string => typeof description === 'string')
    .join('; ')
}
