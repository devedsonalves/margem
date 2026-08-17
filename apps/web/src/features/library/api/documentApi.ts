import type { DocumentDTO } from '@margem/types'
import { apiRequest } from '@/shared/api/httpClient'

type DocumentPayload = Partial<DocumentDTO> & {
  user_id?: string
  file_path?: string
  file_size?: number
  total_pages?: number
  current_page?: number
  created_at?: string
}

function normalizeDocument(document: DocumentPayload): DocumentDTO {
  return {
    id: document.id ?? '',
    userId: document.userId ?? document.user_id ?? '',
    title: document.title ?? 'Documento sem título',
    filePath: document.filePath ?? document.file_path ?? '',
    fileSize: document.fileSize ?? document.file_size ?? 0,
    totalPages: document.totalPages ?? document.total_pages ?? 0,
    currentPage: document.currentPage ?? document.current_page ?? 1,
    createdAt: document.createdAt ?? document.created_at ?? ''
  }
}

export const documentApi = {
  async list() {
    const payload = await apiRequest<DocumentPayload[]>('/documents')
    return Array.isArray(payload) ? payload.map(normalizeDocument) : []
  },

  async getById(id: string) {
    const documents = await documentApi.list()
    return documents.find(document => document.id === id) ?? null
  },

  async getUrl(id: string) {
    const payload = await apiRequest<{ url: string }>(`/documents/${id}/url`)
    return payload.url
  },

  async upload(file: File, title: string, totalPages: number) {
    const body = new FormData()
    body.append('pdf', file)
    body.append('title', title)
    body.append('total_pages', totalPages.toString())

    const payload = await apiRequest<DocumentPayload>('/documents/upload', {
      method: 'POST',
      body
    })
    return normalizeDocument(payload)
  },

  async updateProgress(id: string, progress: { currentPage?: number; totalPages?: number }) {
    const payload = await apiRequest<DocumentPayload>(`/documents/${id}/progress`, {
      method: 'PATCH',
      body: {
        current_page: progress.currentPage,
        total_pages: progress.totalPages
      }
    })
    return normalizeDocument(payload)
  },

  async remove(id: string) {
    await apiRequest<void>(`/documents/${id}`, { method: 'DELETE' })
  }
}
