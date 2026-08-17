import type { HighlightDTO, NotebookDTO } from '@margem/types'
import { apiRequest } from '@/shared/api/httpClient'

type HighlightPayload = Partial<HighlightDTO> & {
  document_id?: string
  page_number?: number
  text_content?: string
  color_token?: string
  bounding_rects?: HighlightDTO['boundingRects']
  created_at?: string
}

type NotebookPayload = Partial<NotebookDTO> & {
  document_id?: string
  user_id?: string
  content_json?: NotebookDTO['contentJson']
  updated_at?: string
}

function normalizeHighlight(highlight: HighlightPayload): HighlightDTO {
  return {
    id: highlight.id ?? '',
    documentId: highlight.documentId ?? highlight.document_id ?? '',
    pageNumber: highlight.pageNumber ?? highlight.page_number ?? 1,
    textContent: highlight.textContent ?? highlight.text_content ?? '',
    colorToken: highlight.colorToken ?? highlight.color_token ?? 'highlight-yellow',
    boundingRects: highlight.boundingRects ?? highlight.bounding_rects ?? [],
    createdAt: highlight.createdAt ?? highlight.created_at ?? ''
  }
}

function normalizeNotebook(notebook: NotebookPayload): NotebookDTO {
  return {
    id: notebook.id ?? '',
    documentId: notebook.documentId ?? notebook.document_id,
    userId: notebook.userId ?? notebook.user_id ?? '',
    contentJson: notebook.contentJson ?? notebook.content_json ?? {},
    updatedAt: notebook.updatedAt ?? notebook.updated_at ?? ''
  }
}

export const readerApi = {
  async listHighlights(documentId: string) {
    const payload = await apiRequest<HighlightPayload[]>(`/highlights/${documentId}`)
    return Array.isArray(payload) ? payload.map(normalizeHighlight) : []
  },

  async addHighlight(highlight: Partial<HighlightDTO>) {
    const payload = await apiRequest<HighlightPayload>('/highlights', {
      method: 'POST',
      body: {
        document_id: highlight.documentId,
        page_number: highlight.pageNumber,
        text_content: highlight.textContent,
        color_token: highlight.colorToken,
        bounding_rects: highlight.boundingRects
      }
    })
    return normalizeHighlight(payload)
  },

  async removeHighlight(id: string) {
    await apiRequest<void>(`/highlights/${id}`, { method: 'DELETE' })
  },

  async getNotebook(documentId: string) {
    const payload = await apiRequest<NotebookPayload>(`/notebooks?documentId=${encodeURIComponent(documentId)}`)
    return normalizeNotebook(payload)
  },

  async saveNotebook(notebookId: string, contentJson: NotebookDTO['contentJson']) {
    await apiRequest<void>(`/notebooks/${notebookId}`, {
      method: 'PATCH',
      body: { content_json: contentJson }
    })
  }
}
