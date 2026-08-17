'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import { documentApi } from '@/features/library/api/documentApi'

type PdfCoverProps = {
  documentId: string
  fill?: boolean
  title: string
}

type PdfJsModule = typeof import('pdfjs-dist')
type PdfLoadingTask = ReturnType<PdfJsModule['getDocument']>
type PdfDocument = Awaited<PdfLoadingTask['promise']>

const MAX_CONCURRENT_COVER_RENDERS = 2
const urlCache = new Map<string, Promise<string>>()
const renderQueue: Array<() => void> = []

let pdfjsPromise: Promise<PdfJsModule> | null = null
let activeCoverRenders = 0

function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
      ).toString()
      return pdfjs
    })
  }

  return pdfjsPromise
}

function getCachedDocumentUrl(documentId: string) {
  let cachedUrl = urlCache.get(documentId)
  if (!cachedUrl) {
    cachedUrl = documentApi.getUrl(documentId)
    urlCache.set(documentId, cachedUrl)
  }

  return cachedUrl
}

function runWithCoverRenderLimit<T>(task: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      activeCoverRenders += 1

      task()
        .then(resolve, reject)
        .finally(() => {
          activeCoverRenders -= 1
          renderQueue.shift()?.()
        })
    }

    if (activeCoverRenders < MAX_CONCURRENT_COVER_RENDERS) {
      run()
      return
    }

    renderQueue.push(run)
  })
}

async function renderPdfCover(documentId: string, canvas: HTMLCanvasElement) {
  return runWithCoverRenderLimit(async () => {
    let loadingTask: PdfLoadingTask | null = null
    let loadedPdf: PdfDocument | null = null

    try {
      const [pdfjs, url] = await Promise.all([getPdfJs(), getCachedDocumentUrl(documentId)])

      loadingTask = pdfjs.getDocument({ url })
      const pdf = await loadingTask.promise
      loadedPdf = pdf

      const page = await pdf.getPage(1)
      const baseViewport = page.getViewport({ scale: 1 })
      const pixelRatio = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      const scale = (420 / baseViewport.width) * pixelRatio
      const viewport = page.getViewport({ scale })
      const context = canvas.getContext('2d', { alpha: false })

      if (!context) throw new Error('Canvas context unavailable')

      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)

      await page.render({ canvasContext: context, viewport }).promise
    } finally {
      loadedPdf?.destroy()
      loadingTask?.destroy()
    }
  })
}

export function PdfCover({ documentId, fill = false, title }: PdfCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    let cancelled = false

    setStatus('idle')

    const loadCover = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      setStatus('loading')

      renderPdfCover(documentId, canvas)
        .then(() => {
          if (cancelled) return
          setStatus('ready')
        })
        .catch(error => {
          console.error('Failed to render PDF cover', error)
          if (!cancelled) setStatus('error')
        })
    }

    const container = containerRef.current

    if (!container || typeof IntersectionObserver === 'undefined') {
      loadCover()
      return () => {
        cancelled = true
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        loadCover()
      },
      { rootMargin: '480px 0px' }
    )

    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [documentId])

  return (
    <div
      ref={containerRef}
      className={[
        'relative flex w-full items-center justify-center overflow-hidden bg-[#e4e2e3] text-center',
        fill ? 'h-full' : 'aspect-[3/4]'
      ].join(' ')}
    >
      {status !== 'error' ? (
        <canvas
          ref={canvasRef}
          aria-label={`Capa de ${title}`}
          className={[
            'h-full w-full bg-white object-cover transition-opacity duration-300',
            status === 'ready' ? 'opacity-100' : 'opacity-0'
          ].join(' ')}
        />
      ) : null}

      {status === 'idle' || status === 'loading' ? (
        <div className='absolute inset-6 animate-pulse rounded-brand bg-[#f5f3f4]' />
      ) : null}

      {status === 'error' ? (
        <div className='flex size-20 items-center justify-center rounded-brand border border-[#c5c6cd] bg-[#fbf8fa]'>
          <FileText className='size-9 text-[#091426]' strokeWidth={1.7} />
        </div>
      ) : null}
    </div>
  )
}
