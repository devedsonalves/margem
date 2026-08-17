'use client'

import { useEffect, useMemo, useState, type ElementType } from 'react'
import { FilePenLine, Quote } from 'lucide-react'
import type { HighlightDTO } from '@margem/types'
import { useReader } from '@/features/reader/ReaderProvider'
import { NotebookQuotesPanel } from '@/features/reader/components/NotebookQuotesPanel'
import { NotebookWritingPanel } from '@/features/reader/components/NotebookWritingPanel'
import {
  countWords,
  emptyWritingDraft,
  getNotebookContent,
  getWritingDraft,
  normalizeNotebookText,
  type WritingDraft
} from '@/features/reader/model/notebook'

type NotebookTabId = 'writing' | 'quotes'

export function Notebook() {
  const { document, highlights, notebook, updateNotebook } = useReader()
  const [activeTab, setActiveTab] = useState<NotebookTabId>('writing')
  const [draft, setDraft] = useState<WritingDraft>(emptyWritingDraft)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const storedDraft = getWritingDraft(notebook)
    setDraft({
      body: storedDraft.body,
      title: storedDraft.title || (document ? `Notas sobre ${document.title}` : '')
    })
    setSaved(false)
  }, [document, notebook])

  const sortedHighlights = useMemo(
    () =>
      [...highlights].sort((first, second) => {
        if (first.pageNumber !== second.pageNumber) {
          return first.pageNumber - second.pageNumber
        }
        return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
      }),
    [highlights]
  )

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateNotebook({
        ...getNotebookContent(notebook),
        writingDraft: { ...draft, updatedAt: new Date().toISOString() }
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const appendQuote = (highlight: HighlightDTO) => {
    setDraft(current => ({
      ...current,
      body: `${current.body.trimEnd()}\n\n> ${normalizeNotebookText(highlight.textContent) || `Citação da página ${highlight.pageNumber}`}\n> p. ${highlight.pageNumber}`
    }))
    setActiveTab('writing')
    setSaved(false)
  }

  return (
    <div className='flex h-full w-full flex-col bg-white text-[#091426]'>
      <header className='border-b border-[#e4e2e3] px-4 py-4'>
        <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[#75777d]'>Caderno</p>
        <h2 className='mt-1 truncate font-serif text-xl font-medium leading-7'>{document?.title || 'Documento'}</h2>
      </header>

      <div className='grid grid-cols-2 border-b border-[#e4e2e3]'>
        <NotebookTab
          active={activeTab === 'writing'}
          icon={FilePenLine}
          label='Escrita'
          onClick={() => setActiveTab('writing')}
        />
        <NotebookTab
          active={activeTab === 'quotes'}
          icon={Quote}
          label='Citações'
          onClick={() => setActiveTab('quotes')}
        />
      </div>

      {activeTab === 'writing' ? (
        <NotebookWritingPanel
          body={draft.body}
          onChange={body => {
            setDraft(current => ({ ...current, body }))
            setSaved(false)
          }}
          onSave={handleSave}
          saved={saved}
          saving={saving}
          wordCount={countWords(draft.body)}
        />
      ) : (
        <NotebookQuotesPanel highlights={sortedHighlights} onAppend={appendQuote} />
      )}
    </div>
  )
}

function NotebookTab({
  active,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean
  icon: ElementType
  label: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={[
        'flex h-14 items-center justify-center gap-2 bg-white text-sm font-medium transition',
        active ? 'border-b-2 border-[#091426] text-[#091426]' : 'text-[#5a5f62] hover:bg-[#fbf8fa] hover:text-[#091426]'
      ].join(' ')}
    >
      <Icon className='size-4' strokeWidth={1.8} />
      {label}
    </button>
  )
}
