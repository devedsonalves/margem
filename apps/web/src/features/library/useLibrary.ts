'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DocumentDTO } from '@margem/types'
import { useAuth } from '@/features/auth/AuthProvider'
import { documentApi } from '@/features/library/api/documentApi'
import { buildLibraryItems, type ViewMode } from '@/features/library/model/libraryItem'
import { useDocumentUpload } from '@/features/library/useDocumentUpload'

export function useLibrary() {
  const { isLoading: authLoading, logout, token } = useAuth()
  const [documents, setDocuments] = useState<DocumentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const refresh = useCallback(async () => {
    if (!token) return

    setLoading(true)
    try {
      setDocuments(await documentApi.list())
    } catch (error) {
      console.error('Failed to fetch documents', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setLoading(false)
      return
    }

    refresh()
  }, [authLoading, refresh, token])

  const { uploadDocument, uploading } = useDocumentUpload(refresh)

  const removeDocument = useCallback(async (id: string) => {
    setDeletingDocumentId(id)
    try {
      await documentApi.remove(id)
      setDocuments(current => current.filter(document => document.id !== id))
    } finally {
      setDeletingDocumentId(null)
    }
  }, [])

  const items = useMemo(() => buildLibraryItems(documents, query), [documents, query])

  return {
    deletingDocumentId,
    documentCount: documents.length,
    items,
    loading,
    logout,
    query,
    removeDocument,
    setQuery,
    setViewMode,
    uploadDocument,
    uploading,
    viewMode
  }
}
