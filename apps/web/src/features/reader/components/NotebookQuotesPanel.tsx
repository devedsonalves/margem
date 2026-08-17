import { Plus } from 'lucide-react'
import type { HighlightDTO } from '@margem/types'
import { getHighlightColorClass } from '@/features/reader/model/highlightColors'
import { normalizeNotebookText } from '@/features/reader/model/notebook'

export function NotebookQuotesPanel({
  highlights,
  onAppend
}: {
  highlights: HighlightDTO[]
  onAppend: (highlight: HighlightDTO) => void
}) {
  if (highlights.length === 0) {
    return (
      <section className='flex min-h-0 flex-1 items-center bg-[#f5f3f4] px-4'>
        <div className='rounded-brand border border-dashed border-[#c5c6cd] bg-white p-4'>
          <p className='font-serif text-xl leading-7 text-[#091426]'>Nenhuma citação ainda</p>
          <p className='mt-2 text-sm leading-6 text-[#5a5f62]'>
            Use o marca-texto no PDF para salvar trechos. Eles aparecerão aqui.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='min-h-0 flex-1 overflow-auto bg-[#f5f3f4] px-4 py-4'>
      <div className='flex flex-col gap-3'>
        {highlights.map(highlight => (
          <QuoteCard key={highlight.id} highlight={highlight} onAppend={onAppend} />
        ))}
      </div>
    </section>
  )
}

function QuoteCard({ highlight, onAppend }: { highlight: HighlightDTO; onAppend: (highlight: HighlightDTO) => void }) {
  return (
    <article className='rounded-brand border border-[#c5c6cd] bg-white p-4'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <span
          className={`size-3 rounded-full border border-[#9b9da3] ${getHighlightColorClass(highlight.colorToken)}`}
        />
        <span className='text-xs font-semibold uppercase tracking-[0.08em] text-[#5a5f62]'>
          p. {highlight.pageNumber}
        </span>
      </div>
      <blockquote className='border-l-2 border-[#c5c6cd] pl-3'>
        <p className='text-sm italic leading-6 text-[#45474c]'>
          {normalizeNotebookText(highlight.textContent) || `Citação da página ${highlight.pageNumber}`}
        </p>
      </blockquote>
      <button
        type='button'
        onClick={() => onAppend(highlight)}
        className='mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-brand border border-[#75777d] text-sm font-medium text-[#091426] transition hover:border-[#091426] hover:bg-[#fbf8fa]'
      >
        <Plus className='size-4' strokeWidth={1.8} />
        Inserir na escrita
      </button>
    </article>
  )
}
