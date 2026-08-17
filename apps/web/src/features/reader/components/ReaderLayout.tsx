'use client'

import React, { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpenText, ChevronLeft, Eraser, Highlighter } from 'lucide-react'
import { useReader } from '@/features/reader/ReaderProvider'
import { highlightColors } from '@/features/reader/model/highlightColors'

export function ReaderLayout({ viewer, notebook }: { viewer: React.ReactNode; notebook: React.ReactNode }) {
  const {
    currentPage,
    document,
    highlightColorToken,
    isEraserMode,
    isHighlightMode,
    setHighlightColorToken,
    setIsEraserMode,
    setIsHighlightMode
  } = useReader()
  const totalPages = document?.totalPages || 0
  const [notebookWidth, setNotebookWidth] = useState(360)
  const [mobilePanel, setMobilePanel] = useState<'reader' | 'notebook'>('reader')
  const dragStartRef = useRef<{ pointerX: number; width: number } | null>(null)

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      dragStartRef.current = {
        pointerX: event.clientX,
        width: notebookWidth
      }

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const start = dragStartRef.current
        if (!start) return

        const nextWidth = start.width + start.pointerX - moveEvent.clientX
        setNotebookWidth(Math.min(Math.max(nextWidth, 300), 640))
      }

      const handlePointerUp = () => {
        dragStartRef.current = null
        globalThis.document.body.style.cursor = ''
        globalThis.document.body.style.userSelect = ''
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      globalThis.document.body.style.cursor = 'col-resize'
      globalThis.document.body.style.userSelect = 'none'
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [notebookWidth]
  )

  return (
    <div className='flex h-[100dvh] overflow-hidden bg-[#fbf8fa] text-[#091426] lg:h-screen'>
      <aside className='z-20 hidden h-screen w-20 shrink-0 border-r border-[#c5c6cd] bg-[#fbf8fa] px-4 py-5 lg:block'>
        <nav className='flex flex-col items-center gap-[25px]'>
          <Link
            href='/inicio'
            aria-label='Voltar ao acervo'
            title='Voltar ao acervo'
            className='flex size-9 items-center justify-center rounded-brand bg-[#091426] text-white transition hover:bg-[#17243a]'
          >
            <ChevronLeft className='size-[17px]' strokeWidth={1.8} />
          </Link>
          <button
            type='button'
            aria-pressed={isHighlightMode}
            aria-label='Marca-texto'
            title={isHighlightMode ? 'Desativar marca-texto' : 'Ativar marca-texto'}
            onClick={() => setIsHighlightMode(!isHighlightMode)}
            className={[
              'flex size-9 items-center justify-center rounded-brand transition',
              isHighlightMode
                ? 'bg-[#fadfb8] text-[#091426] ring-1 ring-[#c5c6cd]'
                : 'text-[#5a5f62] hover:bg-[#f0edef] hover:text-[#091426]'
            ].join(' ')}
          >
            <Highlighter className='size-[17px]' strokeWidth={1.8} />
          </button>
          <div className='flex flex-col items-center gap-2' aria-label='Cores do marca-texto'>
            {highlightColors.map(color => {
              const isSelected = highlightColorToken === color.token && isHighlightMode

              return (
                <button
                  key={color.token}
                  type='button'
                  aria-label={`Marca-texto ${color.label}`}
                  aria-pressed={isSelected}
                  title={`Marca-texto ${color.label}`}
                  onClick={() => setHighlightColorToken(color.token)}
                  className={[
                    'flex size-7 items-center justify-center rounded-brand border transition hover:border-[#091426]',
                    isSelected ? 'border-[#091426] bg-white' : 'border-transparent'
                  ].join(' ')}
                >
                  <span className={['block size-4 rounded-full border border-[#9b9da3]', color.className].join(' ')} />
                </button>
              )
            })}
          </div>
          <button
            type='button'
            aria-pressed={isEraserMode}
            aria-label='Borracha'
            title={isEraserMode ? 'Desativar borracha' : 'Ativar borracha'}
            onClick={() => setIsEraserMode(!isEraserMode)}
            className={[
              'flex size-9 items-center justify-center rounded-brand transition',
              isEraserMode
                ? 'bg-[#fee2e2] text-[#991b1b] ring-1 ring-[#ef4444]'
                : 'text-[#5a5f62] hover:bg-[#f0edef] hover:text-[#091426]'
            ].join(' ')}
          >
            <Eraser className='size-[17px]' strokeWidth={1.8} />
          </button>
        </nav>
        <div className='mt-8 border-t border-[#c5c6cd] pt-4 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5a5f62]'>
          <span className='block text-[#091426]'>{currentPage}</span>
          <span>de {totalPages || '-'}</span>
        </div>
      </aside>

      <main
        className={[
          'min-w-0 flex-1 flex-col overflow-hidden bg-[#fbf8fa] px-2 py-2 sm:px-3 lg:flex lg:h-screen lg:px-8 lg:py-4',
          mobilePanel === 'reader' ? 'flex' : 'hidden'
        ].join(' ')}
      >
        <div className='mb-2 shrink-0 lg:hidden'>
          <div className='flex h-11 items-center gap-2 border-b border-[#c5c6cd] bg-[#fbf8fa]'>
            <Link
              href='/inicio'
              aria-label='Voltar ao acervo'
              title='Voltar ao acervo'
              className='flex size-9 shrink-0 items-center justify-center rounded-brand bg-[#091426] text-white'
            >
              <ChevronLeft className='size-[17px]' strokeWidth={1.8} />
            </Link>
            <p className='min-w-0 flex-1 truncate text-sm font-semibold text-[#091426]'>{document?.title || 'Leitor'}</p>
            <span className='shrink-0 text-[11px] font-semibold text-[#5a5f62]'>
              {currentPage} / {totalPages || '-'}
            </span>
            <button
              type='button'
              aria-label='Abrir caderno'
              title='Abrir caderno'
              onClick={() => setMobilePanel('notebook')}
              className='flex size-9 shrink-0 items-center justify-center rounded-brand border border-[#c5c6cd] bg-white text-[#091426]'
            >
              <BookOpenText className='size-[17px]' strokeWidth={1.8} />
            </button>
          </div>
          <div className='flex min-h-11 items-center gap-1 overflow-x-auto border-b border-[#c5c6cd] bg-white px-1 py-1'>
            <button
              type='button'
              aria-pressed={isHighlightMode}
              aria-label='Marca-texto'
              title={isHighlightMode ? 'Desativar marca-texto' : 'Ativar marca-texto'}
              onClick={() => setIsHighlightMode(!isHighlightMode)}
              className={[
                'flex size-9 shrink-0 items-center justify-center rounded-brand transition',
                isHighlightMode ? 'bg-[#fadfb8] text-[#091426] ring-1 ring-[#c5c6cd]' : 'text-[#5a5f62] hover:bg-[#f0edef]'
              ].join(' ')}
            >
              <Highlighter className='size-[17px]' strokeWidth={1.8} />
            </button>
            {highlightColors.map(color => {
              const isSelected = highlightColorToken === color.token && isHighlightMode
              return (
                <button
                  key={color.token}
                  type='button'
                  aria-label={`Marca-texto ${color.label}`}
                  aria-pressed={isSelected}
                  title={`Marca-texto ${color.label}`}
                  onClick={() => setHighlightColorToken(color.token)}
                  className={[
                    'flex size-8 shrink-0 items-center justify-center rounded-brand border transition',
                    isSelected ? 'border-[#091426] bg-white' : 'border-transparent'
                  ].join(' ')}
                >
                  <span className={['block size-4 rounded-full border border-[#9b9da3]', color.className].join(' ')} />
                </button>
              )
            })}
            <button
              type='button'
              aria-pressed={isEraserMode}
              aria-label='Borracha'
              title={isEraserMode ? 'Desativar borracha' : 'Ativar borracha'}
              onClick={() => setIsEraserMode(!isEraserMode)}
              className={[
                'flex size-9 shrink-0 items-center justify-center rounded-brand transition',
                isEraserMode ? 'bg-[#fee2e2] text-[#991b1b] ring-1 ring-[#ef4444]' : 'text-[#5a5f62] hover:bg-[#f0edef]'
              ].join(' ')}
            >
              <Eraser className='size-[17px]' strokeWidth={1.8} />
            </button>
          </div>
        </div>
        <div className='min-h-0 flex-1 lg:contents'>{viewer}</div>
      </main>

      <div
        role='separator'
        aria-orientation='vertical'
        aria-label='Redimensionar caderno'
        title='Redimensionar caderno'
        onPointerDown={handleResizePointerDown}
        className='group hidden h-screen w-2 shrink-0 cursor-col-resize items-stretch justify-center bg-[#fbf8fa] transition hover:bg-[#ece8eb] lg:flex'
      >
        <span className='h-full w-px bg-[#c5c6cd] transition group-hover:bg-[#091426]' />
      </div>

      <aside
        className={[
          'h-[100dvh] w-full shrink-0 flex-col bg-white lg:flex lg:h-screen lg:w-[var(--notebook-width)]',
          mobilePanel === 'notebook' ? 'flex' : 'hidden'
        ].join(' ')}
        style={{ '--notebook-width': `${notebookWidth}px` } as React.CSSProperties}
      >
        <div className='flex h-11 shrink-0 items-center justify-between border-b border-[#c5c6cd] px-3 lg:hidden'>
          <button
            type='button'
            aria-label='Voltar para a leitura'
            title='Voltar para a leitura'
            onClick={() => setMobilePanel('reader')}
            className='flex size-9 items-center justify-center rounded-brand text-[#091426] hover:bg-[#f0edef]'
          >
            <ChevronLeft className='size-[18px]' strokeWidth={1.8} />
          </button>
          <span className='text-sm font-semibold text-[#091426]'>Caderno</span>
          <span className='size-9' aria-hidden='true' />
        </div>
        <div className='min-h-0 flex-1 lg:contents'>{notebook}</div>
      </aside>
    </div>
  )
}
