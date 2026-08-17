'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DocumentDTO, HighlightDTO } from '@margem/types'
import { useAuth } from '@/features/auth/AuthProvider'
import { documentApi } from '@/features/library/api/documentApi'
import { readerApi } from '@/features/reader/api/readerApi'
import { buildHomeDashboard } from '@/features/home/model/homeDashboard'
import { useDocumentUpload } from '@/features/library/useDocumentUpload'

export function useHomeDashboard() {
  const { isLoading: authLoading, logout, token, user } = useAuth()
  const [documents, setDocuments] = useState<DocumentDTO[]>([])
  const [highlights, setHighlights] = useState<HighlightDTO[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!token) return

    setLoading(true)
    try {
      const nextDocuments = await documentApi.list()
      const highlightGroups = await Promise.all(
        nextDocuments.slice(0, 12).map(async document => {
          try {
            return await readerApi.listHighlights(document.id)
          } catch (error) {
            console.error('Failed to fetch highlights', error)
            return []
          }
        })
      )

      setDocuments(nextDocuments)
      setHighlights(highlightGroups.flat())
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
      setDocuments([])
      setHighlights([])
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

  const dashboard = useMemo(() => buildHomeDashboard(documents, highlights, loading), [documents, highlights, loading])

  return {
    dashboard,
    firstName: user?.name?.trim().split(' ')[0] || 'leitor',
    loading,
    logout,
    uploadDocument,
    uploading
  }
}
