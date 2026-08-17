export interface BoundingRect {
  x?: number
  y?: number
  left?: number
  top?: number
  width: number
  height: number
  pageIndex?: number
}

export interface HighlightDTO {
  id: string
  documentId: string
  pageNumber: number
  textContent: string
  colorToken: string
  boundingRects: BoundingRect[]
  createdAt: string
}

export interface DocumentDTO {
  id: string
  userId: string
  title: string
  filePath: string
  fileSize: number
  totalPages: number
  currentPage: number
  createdAt: string
}

export interface MarginNoteDTO {
  id: string
  highlightId: string
  commentText: string
  updatedAt: string
}

export interface NotebookDTO {
  id: string
  documentId?: string
  userId: string
  contentJson: unknown
  updatedAt: string
}

export type PlanCode = 'FREE' | 'ESSENTIAL' | 'PREMIUM'
export type PlanStatus = 'FREE' | 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'

export interface PlanDTO {
  code: PlanCode
  name: string
  description: string
  priceCents: number
  currency: 'BRL'
  interval: 'MONTHLY'
  documentLimit: number | null
  highlightLimit: number | null
  features: string[]
  recommended?: boolean
}

export interface BillingSubscriptionDTO {
  id?: string
  plan: PlanCode
  status: PlanStatus
  activatedAt?: string | null
  currentPeriodEnd?: string | null
  externalSubscriptionId?: string | null
}

export interface BillingOverviewDTO {
  currentPlan: PlanCode
  planStatus: PlanStatus
  activatedAt?: string | null
  expiresAt?: string | null
  subscription?: BillingSubscriptionDTO | null
  pendingCheckout?: CheckoutSessionDTO | null
}

export interface CheckoutSessionDTO {
  id: string
  plan: PlanCode
  checkoutUrl: string
  status: 'CREATED' | 'PAID' | 'EXPIRED' | 'CANCELED'
}
