'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Plus, Save } from 'lucide-react'
import {
  joinNotebookPages,
  notebookPageCharLimit,
  notebookPageLineCount,
  paginateNotebookText
} from '@/features/reader/model/notebook'

type NotebookWritingPanelProps = {
  body: string
  saved: boolean
  saving: boolean
  wordCount: number
  onChange: (body: string) => void
  onSave: () => void
}

export function NotebookWritingPanel({ body, onChange, onSave, saved, saving, wordCount }: NotebookWritingPanelProps) {
  const pages = useMemo(() => paginateNotebookText(body), [body])
  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = pages.length
  const currentPage = pages[Math.min(pageIndex, pageCount - 1)] || ''

  useEffect(() => {
    setPageIndex(current => Math.min(current, Math.max(pageCount - 1, 0)))
  }, [pageCount])

  const updateCurrentPage = (nextPageBody: string) => {
    const normalizedPageBody = nextPageBody.replace(/\r\n/g, '\n')
    const visibleBody = normalizedPageBody.slice(0, notebookPageCharLimit)
    const overflowBody = normalizedPageBody.slice(notebookPageCharLimit)
    const nextPages = [...pages]
    const safePageIndex = Math.min(pageIndex, nextPages.length - 1)

    nextPages[safePageIndex] = visibleBody
    if (overflowBody) {
      nextPages.splice(safePageIndex + 1, 0, overflowBody)
      setPageIndex(safePageIndex + 1)
    }
    onChange(joinNotebookPages(nextPages))
  }

  const addPage = () => {
    onChange(joinNotebookPages([...pages, '']))
    setPageIndex(pageCount)
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col bg-[#f5f3f4]'>
      <div className='min-h-0 flex-1 overflow-hidden px-3 py-3'>
        <div className='relative flex h-full min-h-0 flex-col overflow-hidden rounded-brand border border-[#d7d0c5] bg-[#fffdf5] shadow-[0_1px_1px_rgba(9,20,38,0.04),0_10px_24px_rgba(9,20,38,0.06)]'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-y-0 left-[36px] z-10 w-px bg-[#e7a7a2]'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-y-0 left-[37px] z-10 w-px bg-[#f4d2cd]'
          />
          <div className='pointer-events-none absolute left-3 top-5 z-10 flex flex-col gap-[26px]'>
            {Array.from({ length: notebookPageLineCount }).map((_, index) => (
              <span key={index} className='size-2 rounded-full border border-[#d4c9ba] bg-[#f5f3ea] shadow-inner' />
            ))}
          </div>
          <textarea
            value={currentPage}
            onChange={event => updateCurrentPage(event.target.value)}
            placeholder='Escreva a partir das suas marcações...'
            spellCheck
            className='relative z-0 min-h-0 flex-1 basis-0 resize-none overflow-hidden bg-[linear-gradient(to_bottom,transparent_0,transparent_27px,#e7eff4_27.5px,transparent_28px)] bg-[length:100%_32px] px-12 py-[7px] text-[16px] leading-[32px] text-[#1d2430] outline-none placeholder:text-[#a7a095]'
            style={{ fontFamily: '"Segoe Print", "Bradley Hand ITC", "Comic Sans MS", cursive' }}
          />
          <div className='relative z-20 flex h-12 items-center justify-between border-t border-[#e2d9ca] bg-[#fffaf0] px-4'>
            <PageButton
              direction='previous'
              disabled={pageIndex === 0}
              onClick={() => setPageIndex(current => Math.max(current - 1, 0))}
            />
            <div className='flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#7a7065]'>
              <span>
                Página {pageIndex + 1} de {pageCount}
              </span>
              <button
                type='button'
                onClick={addPage}
                className='flex size-7 items-center justify-center rounded-brand border border-[#d7d0c5] bg-white text-[#5a5f62] transition hover:border-[#091426] hover:text-[#091426]'
                aria-label='Nova página'
                title='Nova página'
              >
                <Plus className='size-3.5' strokeWidth={1.8} />
              </button>
            </div>
            <PageButton
              direction='next'
              disabled={pageIndex >= pageCount - 1}
              onClick={() => setPageIndex(current => Math.min(current + 1, pageCount - 1))}
            />
          </div>
        </div>
      </div>

      <footer className='border-t border-[#d8d5d6] bg-white px-4 py-4'>
        <div className='flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#5a5f62]'>
          {saved ? (
            <span className='inline-flex items-center gap-1.5 text-[#1f6f4a]'>
              <Check className='size-3.5' />
              salvo
            </span>
          ) : null}
        </div>
        <button
          type='button'
          onClick={onSave}
          disabled={saving}
          className='flex h-10 w-full items-center justify-center gap-2 rounded-brand bg-[#091426] px-4 text-sm font-medium text-white transition hover:bg-[#17243a] disabled:cursor-not-allowed disabled:opacity-60'
        >
          <Save className='size-4' strokeWidth={1.8} />
          {saving ? 'Salvando...' : 'Salvar escrita'}
        </button>
      </footer>
    </section>
  )
}

function PageButton({
  direction,
  disabled,
  onClick
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  const label = direction === 'previous' ? 'Página anterior' : 'Próxima página'

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className='flex size-8 items-center justify-center rounded-brand text-[#5a5f62] transition hover:bg-[#f2eadb] hover:text-[#091426] disabled:cursor-not-allowed disabled:opacity-35'
    >
      <Icon className='size-4' strokeWidth={1.8} />
    </button>
  )
}
