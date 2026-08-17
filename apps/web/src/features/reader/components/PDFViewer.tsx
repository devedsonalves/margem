'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useReader } from '@/features/reader/ReaderProvider'
import { HighlightTarget, SavedHighlights } from '@/features/reader/components/PdfHighlights'
import { normalizeHighlightArea } from '@/features/reader/model/highlightArea'
import { PageLayout, Viewer, Worker } from '@react-pdf-viewer/core'
import { Minus, Plus } from 'lucide-react'
import { Trigger, highlightPlugin } from '@react-pdf-viewer/highlight'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/highlight/lib/styles/index.css'

const zoomOptions = [0.65, 0.75, 0.85, 1, 1.15, 1.3, 1.5]
const pdfPageGap = 4

export function PDFViewer() {
  const {
    addHighlight,
    currentPage,
    deleteHighlight,
    document,
    highlightColorToken,
    highlights,
    isEraserMode,
    isHighlightMode,
    pdfUrl,
    setCurrentPage,
    updateDocumentTotalPages
  } = useReader()
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.65 : 0.85))

  const savedAreas = useMemo(
    () =>
      highlights.flatMap(highlight => {
        const areas = Array.isArray(highlight.boundingRects) ? highlight.boundingRects : []

        return areas.map(area => ({
          highlightId: highlight.id,
          colorToken: highlight.colorToken,
          area: normalizeHighlightArea(area, highlight.pageNumber)
        }))
      }),
    [highlights]
  )

  const highlightPluginInstance = highlightPlugin({
    trigger: Trigger.None,
    renderHighlightTarget: props => (
      <HighlightTarget
        {...props}
        onSave={async () => {
          await addHighlight({
            pageNumber: props.selectionRegion.pageIndex + 1,
            textContent: props.selectedText,
            colorToken: highlightColorToken,
            boundingRects: props.highlightAreas.map(area => ({
              left: area.left,
              top: area.top,
              width: area.width,
              height: area.height,
              pageIndex: area.pageIndex
            }))
          })
          props.cancel()
        }}
      />
    ),
    renderHighlights: props => (
      <SavedHighlights {...props} areas={savedAreas} isEraserMode={isEraserMode} onDelete={deleteHighlight} />
    )
  })

  useEffect(() => {
    highlightPluginInstance.switchTrigger(isHighlightMode ? Trigger.TextSelection : Trigger.None)
  }, [highlightPluginInstance, isHighlightMode])

  useEffect(() => {
    if (!isHighlightMode) return

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      if (!touch) return

      const element = globalThis.document.elementFromPoint(touch.clientX, touch.clientY)
      const textLayer = element?.closest('.rpv-core__text-layer')
      if (!(textLayer instanceof HTMLElement)) return

      // The highlight plugin listens for mouseup, while mobile browsers finish
      // a text selection with touchend. Give the plugin the same signal after
      // the browser has committed the native selection range.
      window.setTimeout(() => {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || !selection.toString().trim()) return

        textLayer.dispatchEvent(
          new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0
          })
        )
      }, 50)
    }

    globalThis.document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => globalThis.document.removeEventListener('touchend', handleTouchEnd)
  }, [isHighlightMode])

  const currentZoomIndex = zoomOptions.findIndex(option => option === zoom)
  const canZoomOut = currentZoomIndex > 0
  const canZoomIn = currentZoomIndex < zoomOptions.length - 1
  const pageLayout = useMemo<PageLayout>(
    () => ({
      buildPageStyles: ({ numPages, pageIndex }) => ({
        paddingBottom: pageIndex === numPages - 1 ? 0 : pdfPageGap
      }),
      transformSize: ({ numPages, pageIndex, size }) => ({
        height: size.height + (pageIndex === numPages - 1 ? 0 : pdfPageGap),
        width: size.width
      })
    }),
    []
  )

  if (!pdfUrl) {
    return (
      <div className='mx-auto flex h-full min-h-0 w-full items-center justify-center rounded-brand border border-[#e4e2e3] bg-white px-10 text-center shadow-[0_4px_10px_rgba(0,0,0,0.03)]'>
        <div>
          <p className='font-serif text-[28px] leading-[39.2px] text-[#1b1b1d]'>{document?.title || 'Documento'}</p>
          <p className='mt-3 text-sm text-[#45474c]'>Carregando PDF...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='margem-reader-pdf mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden rounded-brand border border-[#e4e2e3] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.03)]'>
      <div className='flex h-10 items-center justify-between gap-2 border-b border-[#e4e2e3] bg-[#fbf8fa] px-2 lg:h-11 lg:gap-3 lg:px-3'>
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={() => setZoom(zoomOptions[currentZoomIndex - 1])}
            disabled={!canZoomOut}
            aria-label='Diminuir zoom'
            title='Diminuir zoom'
            className='flex size-8 items-center justify-center rounded-brand border border-[#c5c6cd] bg-white text-[#091426] transition hover:border-[#091426] disabled:cursor-not-allowed disabled:opacity-40'
          >
            <Minus className='size-4' strokeWidth={1.8} />
          </button>

          <select
            value={zoom}
            onChange={event => setZoom(Number(event.target.value))}
            aria-label='Zoom do PDF'
            className='h-8 min-w-[92px] rounded-brand border border-[#c5c6cd] bg-white px-2 text-sm font-semibold text-[#091426] outline-none transition hover:border-[#091426]'
          >
            {zoomOptions.map(option => (
              <option key={option} value={option}>
                {Math.round(option * 100)}%
              </option>
            ))}
          </select>

          <button
            type='button'
            onClick={() => setZoom(zoomOptions[currentZoomIndex + 1])}
            disabled={!canZoomIn}
            aria-label='Aumentar zoom'
            title='Aumentar zoom'
            className='flex size-8 items-center justify-center rounded-brand border border-[#c5c6cd] bg-white text-[#091426] transition hover:border-[#091426] disabled:cursor-not-allowed disabled:opacity-40'
          >
            <Plus className='size-4' strokeWidth={1.8} />
          </button>
        </div>

        <span className='hidden text-xs font-semibold uppercase tracking-[0.08em] text-[#5a5f62] sm:inline'>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {isHighlightMode || isEraserMode ? (
        <div className='border-b border-[#e4e2e3] bg-[#fff8e8] px-4 py-2 text-center text-xs font-semibold tracking-[0.01em] text-[#091426]'>
          {isEraserMode
            ? 'Borracha ativa: clique em uma marcação para apagá-la.'
            : 'Marca-texto ativo: selecione um trecho no PDF para salvar a marcação.'}
        </div>
      ) : null}
      <div className='min-h-0 flex-1 overflow-hidden bg-white px-0 py-0'>
        <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'>
          <Viewer
            key={`${document?.id}-${zoom}`}
            fileUrl={pdfUrl}
            defaultScale={zoom}
            initialPage={Math.max(currentPage - 1, 0)}
            onDocumentLoad={event => updateDocumentTotalPages(event.doc.numPages)}
            onPageChange={event => setCurrentPage(event.currentPage + 1)}
            pageLayout={pageLayout}
            plugins={[highlightPluginInstance]}
            theme='light'
          />
        </Worker>
      </div>
    </div>
  )
}
