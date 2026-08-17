'use client'

import { useCallback, useState } from 'react'
import type { DocumentDTO, HighlightDTO, NotebookDTO } from '@margem/types'
import { documentApi } from '@/features/library/api/documentApi'
import { readerApi } from '@/features/reader/api/readerApi'
import type { NotebookContent } from '@/features/reader/model/notebook'
import type { HighlightColorToken, ReaderTool } from '@/features/reader/model/reader'

export function useReaderController() {
  const [document, setDocument] = useState<DocumentDTO | null>(null)
  const [highlights, setHighlights] = useState<HighlightDTO[]>([])
  const [notebook, setNotebook] = useState<NotebookDTO | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTool, setActiveTool] = useState<ReaderTool>('select')
  const [highlightColorToken, setHighlightColorTokenState] = useState<HighlightColorToken>('highlight-yellow')
  const [currentPage, setCurrentPageState] = useState(1)

  const setIsHighlightMode = useCallback((enabled: boolean) => {
    setActiveTool(enabled ? 'highlight' : 'select')
  }, [])

  const setIsEraserMode = useCallback((enabled: boolean) => {
    setActiveTool(enabled ? 'eraser' : 'select')
  }, [])

  const setHighlightColorToken = useCallback((colorToken: HighlightColorToken) => {
    setHighlightColorTokenState(colorToken)
    setActiveTool('highlight')
  }, [])

  const loadDocument = useCallback(async (id: string) => {
    setIsLoading(true)
    setHighlights([])
    setNotebook(null)
    setPdfUrl(null)

    try {
      const nextDocument = await documentApi.getById(id)
      setDocument(nextDocument)
      setCurrentPageState(nextDocument?.currentPage || 1)

      const [nextHighlights, nextNotebook, nextPdfUrl] = await Promise.allSettled([
        readerApi.listHighlights(id),
        readerApi.getNotebook(id),
        documentApi.getUrl(id)
      ])

      if (nextHighlights.status === 'fulfilled') setHighlights(nextHighlights.value)
      else console.error('Error loading highlights', nextHighlights.reason)

      if (nextNotebook.status === 'fulfilled') setNotebook(nextNotebook.value)
      else console.error('Error loading notebook', nextNotebook.reason)

      if (nextPdfUrl.status === 'fulfilled') setPdfUrl(nextPdfUrl.value)
      else console.error('Error loading PDF URL', nextPdfUrl.reason)
    } catch (error) {
      console.error('Failed to load document data', error)
      setDocument(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setCurrentPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(Math.floor(page), 1)
      setCurrentPageState(nextPage)
      if (!document) return

      documentApi
        .updateProgress(document.id, { currentPage: nextPage })
        .then(setDocument)
        .catch(error => console.error('Failed to update reading page', error))
    },
    [document]
  )

  const updateDocumentTotalPages = useCallback(
    (totalPages: number) => {
      const nextTotalPages = Math.max(Math.floor(totalPages), 1)
      if (!document || document.totalPages === nextTotalPages) return

      documentApi
        .updateProgress(document.id, { totalPages: nextTotalPages })
        .then(setDocument)
        .catch(error => console.error('Failed to update document total pages', error))
    },
    [document]
  )

  const addHighlight = useCallback(
    async (highlight: Partial<HighlightDTO>) => {
      if (!document) return

      try {
        const savedHighlight = await readerApi.addHighlight({
          ...highlight,
          documentId: document.id
        })
        setHighlights(current => [...current, savedHighlight])
      } catch (error) {
        console.error('Failed to save highlight', error)
      }
    },
    [document]
  )

  const deleteHighlight = useCallback(async (id: string) => {
    try {
      await readerApi.removeHighlight(id)
      setHighlights(current => current.filter(highlight => highlight.id !== id))
    } catch (error) {
      console.error('Failed to delete highlight', error)
    }
  }, [])

  const updateNotebook = useCallback(
    async (content: NotebookContent) => {
      if (!notebook) return

      try {
        await readerApi.saveNotebook(notebook.id, content)
        setNotebook(current => (current ? { ...current, contentJson: content } : current))
      } catch (error) {
        console.error('Failed to update notebook', error)
      }
    },
    [notebook]
  )

  return {
    activeTool,
    addHighlight,
    currentPage,
    deleteHighlight,
    document,
    highlightColorToken,
    highlights,
    isEraserMode: activeTool === 'eraser',
    isHighlightMode: activeTool === 'highlight',
    isLoading,
    loadDocument,
    notebook,
    pdfUrl,
    setCurrentPage,
    setHighlightColorToken,
    setIsEraserMode,
    setIsHighlightMode,
    updateDocumentTotalPages,
    updateNotebook
  }
}

export type ReaderController = ReturnType<typeof useReaderController>
