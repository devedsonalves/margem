import type { DocumentDTO, HighlightDTO } from '@margem/types'

export type Reflection = {
  id: string
  source: string
  text: string
  footer: string
  kind: 'quote' | 'note'
  bookmarked: boolean
}

export type FocusStats = {
  bars: number[]
  deltaLabel: string
  pagesRead: number
  reflections: number
  summary: string
}

export type CurrentReading = {
  document: DocumentDTO | null
  description: string
  progressPercent: number
}

export type HomeDashboard = {
  currentReading: CurrentReading
  focusStats: FocusStats
  greeting: string
  reflections: Reflection[]
}

function selectCurrentDocument(documents: DocumentDTO[]) {
  if (documents.length === 0) return null

  return [...documents].sort((a, b) => {
    const progressDifference = Number(b.currentPage > 1) - Number(a.currentPage > 1)
    if (progressDifference !== 0) return progressDifference

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })[0]
}

function getProgressPercent(document: DocumentDTO | null) {
  if (!document?.totalPages) return 0
  return Math.min(Math.round(((document.currentPage || 1) / document.totalPages) * 100), 100)
}

function formatDocumentDate(document: DocumentDTO) {
  if (!document.createdAt) return 'recentemente'

  const date = new Date(document.createdAt)
  return Number.isNaN(date.getTime()) ? 'recentemente' : date.toLocaleDateString('pt-BR')
}

function buildReadingDescription(document: DocumentDTO | null) {
  if (!document) return ''

  const pages = document.totalPages ? `${document.totalPages} páginas` : 'PDF sem contagem de páginas'
  return `${pages} no seu acervo desde ${formatDocumentDate(document)}.`
}

function buildGreeting(documents: DocumentDTO[], highlights: HighlightDTO[], loading: boolean) {
  if (loading) return 'Organizando seu acervo e suas anotações...'
  if (documents.length === 0) return 'Seu espaço de leitura está pronto para o primeiro documento.'
  if (highlights.length === 0) return `Você tem ${documents.length} documento(s) no acervo.`
  return `${documents.length} documento(s), ${highlights.length} reflexão(ões) e progresso salvo automaticamente.`
}

function formatRelativeDate(rawDate: string, now: Date) {
  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) return 'data recente'

  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'agora'
  if (diffMinutes < 60) return `há ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  return diffDays < 7 ? `há ${diffDays} dia(s)` : date.toLocaleDateString('pt-BR')
}

function buildReflections(highlights: HighlightDTO[], documents: DocumentDTO[], now: Date): Reflection[] {
  const documentsById = new Map(documents.map(document => [document.id, document]))

  return [...highlights]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((highlight, index) => ({
      id: highlight.id,
      source: documentsById.get(highlight.documentId)?.title || 'Documento',
      text: highlight.textContent || `Destaque na página ${highlight.pageNumber}`,
      footer: `Página ${highlight.pageNumber} • ${formatRelativeDate(highlight.createdAt, now)}`,
      kind: index === 2 ? 'note' : 'quote',
      bookmarked: index === 1
    }))
}

function dayIndexFromToday(date: Date, today: Date) {
  if (Number.isNaN(date.getTime())) return -1

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diff = Math.floor((startOfToday - startOfDate) / 86400000)
  return diff < 0 || diff > 6 ? -1 : 6 - diff
}

function isWithinLastDays(rawDate: string, days: number, now: Date) {
  const date = new Date(rawDate)
  return !Number.isNaN(date.getTime()) && now.getTime() - date.getTime() <= days * 86400000
}

function buildActivityBars(documents: DocumentDTO[], highlights: HighlightDTO[], now: Date) {
  const values = Array.from({ length: 7 }, () => 0)

  documents.forEach(document => {
    const index = dayIndexFromToday(new Date(document.createdAt), now)
    if (index >= 0) values[index] += Math.max(document.currentPage || 1, 1)
  })

  highlights.forEach(highlight => {
    const index = dayIndexFromToday(new Date(highlight.createdAt), now)
    if (index >= 0) values[index] += 3
  })

  const max = Math.max(...values, 1)
  return values.map(value => Math.max(6, Math.round((value / max) * 28)))
}

function buildFocusStats(documents: DocumentDTO[], highlights: HighlightDTO[], now: Date): FocusStats {
  const pagesRead = documents.reduce((total, document) => total + Math.max((document.currentPage || 1) - 1, 0), 0)
  const weeklyHighlights = highlights.filter(highlight => isWithinLastDays(highlight.createdAt, 7, now))
  const activeDocuments = documents.filter(document => document.currentPage > 1).length

  return {
    bars: buildActivityBars(documents, weeklyHighlights, now),
    deltaLabel: activeDocuments > 0 ? `+${activeDocuments}` : '0',
    pagesRead,
    reflections: weeklyHighlights.length,
    summary:
      activeDocuments > 0
        ? `${activeDocuments} leitura(s) com progresso registrado`
        : 'Comece uma leitura para formar seu ritmo semanal'
  }
}

export function buildHomeDashboard(
  documents: DocumentDTO[],
  highlights: HighlightDTO[],
  loading: boolean,
  now = new Date()
): HomeDashboard {
  const document = selectCurrentDocument(documents)

  return {
    currentReading: {
      document,
      description: buildReadingDescription(document),
      progressPercent: getProgressPercent(document)
    },
    focusStats: buildFocusStats(documents, highlights, now),
    greeting: buildGreeting(documents, highlights, loading),
    reflections: buildReflections(highlights, documents, now)
  }
}
