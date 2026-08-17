import type { DocumentDTO } from '@margem/types'

export type ViewMode = 'cards' | 'list'

export type LibraryItem = {
  id: string
  title: string
  description: string
  href: string
  addedAt: string
  progress: string
}

function formatDocumentDate(rawDate: string) {
  if (!rawDate) return 'Documento recente'

  const date = new Date(rawDate)
  return Number.isNaN(date.getTime()) ? 'Documento recente' : date.toLocaleDateString('pt-BR')
}

function formatProgress(document: DocumentDTO) {
  if (!document.totalPages) return 'Sem progresso'

  const currentPage = Math.min(Math.max(document.currentPage || 1, 1), document.totalPages)
  return `p. ${currentPage} de ${document.totalPages}`
}

function toLibraryItem(document: DocumentDTO): LibraryItem {
  return {
    id: document.id,
    title: document.title,
    description: document.totalPages ? `${document.totalPages} páginas` : 'Documento pessoal',
    href: `/reader/${document.id}`,
    addedAt: formatDocumentDate(document.createdAt),
    progress: formatProgress(document)
  }
}

export function buildLibraryItems(documents: DocumentDTO[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const items = documents.map(toLibraryItem)

  if (!normalizedQuery) return items

  return items.filter(item => `${item.title} ${item.description}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
}
