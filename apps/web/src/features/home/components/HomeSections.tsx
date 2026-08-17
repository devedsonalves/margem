import Link from 'next/link'
import { ArrowRight, BookOpen, Bookmark, FileText, PenLine, Quote, TrendingUp } from 'lucide-react'
import type { DocumentDTO } from '@margem/types'
import { PdfCover } from '@/features/library/components/PdfCover'
import type { FocusStats, Reflection } from '@/features/home/model/homeDashboard'

export function CurrentlyReadingCard({
  description,
  document,
  loading,
  onUpload,
  progressPercent
}: {
  description: string
  document: DocumentDTO | null
  loading: boolean
  onUpload: () => void
  progressPercent: number
}) {
  if (loading) {
    return (
      <article className='overflow-hidden border border-[#c5c6cd] bg-white p-px shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-2'>
        <div className='flex min-h-[288px] flex-col sm:flex-row'>
          <div className='h-[288px] w-full shrink-0 animate-pulse bg-[#e4e2e3] sm:w-[200px]' />
          <div className='flex flex-1 flex-col justify-center gap-4 p-6'>
            <div className='h-3 w-28 animate-pulse bg-[#e4e2e3]' />
            <div className='h-8 w-3/4 animate-pulse bg-[#e4e2e3]' />
            <div className='h-16 w-full max-w-[360px] animate-pulse bg-[#f5f3f4]' />
            <div className='h-14 w-48 animate-pulse bg-[#091426]' />
          </div>
        </div>
      </article>
    )
  }

  if (!document) {
    return (
      <article className='overflow-hidden border border-[#c5c6cd] bg-white p-px shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-2'>
        <div className='flex min-h-[288px] flex-col sm:flex-row'>
          <div className='flex h-[288px] w-full shrink-0 items-center justify-center bg-[#f5f3f4] sm:w-[200px]'>
            <BookOpen className='size-12 text-[#091426]' strokeWidth={1.6} />
          </div>
          <div className='flex min-h-[288px] flex-1 flex-col justify-center p-6'>
            <p className='mb-[7px] text-xs font-semibold uppercase leading-[14.4px] tracking-[0.1em] text-[#75777d]'>
              LENDO AGORA
            </p>
            <h2 className='mb-2 font-serif text-2xl font-medium leading-[33.6px] text-[#091426]'>
              Nenhuma leitura ativa
            </h2>
            <p className='mb-6 max-w-[360px] text-base leading-6 text-[#5a5f62]'>
              Envie um PDF para começar uma leitura e acompanhar seu progresso aqui.
            </p>
            <button
              type='button'
              onClick={onUpload}
              className='inline-flex h-14 w-fit items-center justify-center gap-2 bg-[#091426] px-12 text-base leading-6 text-white transition hover:bg-[#17243a]'
            >
              Enviar PDF
              <ArrowRight className='size-[13px]' strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className='overflow-hidden border border-[#c5c6cd] bg-white p-px shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-2'>
      <div className='flex min-h-[288px] flex-col sm:flex-row'>
        <div className='h-[288px] w-full shrink-0 overflow-hidden bg-[#f5f3f4] sm:w-[200px]'>
          <PdfCover documentId={document.id} fill title={document.title} />
        </div>
        <div className='flex min-h-[288px] flex-1 flex-col justify-center p-6'>
          <p className='mb-[7px] text-xs font-semibold uppercase leading-[14.4px] tracking-[0.1em] text-[#75777d]'>
            LENDO AGORA
          </p>
          <h2 className='mb-2 font-serif text-2xl font-medium leading-[33.6px] text-[#091426]'>{document.title}</h2>
          <p className='mb-6 max-w-[360px] text-base leading-6 text-[#5a5f62]'>{description}</p>
          <div className='mb-6 flex w-full flex-col gap-1'>
            <div className='flex h-[14px] items-center justify-between text-xs font-semibold leading-[14.4px] text-[#5a5f62]'>
              <span>{progressPercent}% concluído</span>
              <span>
                p. {document.currentPage || 1} de {document.totalPages || '-'}
              </span>
            </div>
            <div className='h-1 overflow-hidden bg-[#e4e2e3]'>
              <div className='h-full bg-[#091426]' style={{ width: `${Math.max(progressPercent, 1)}%` }} />
            </div>
          </div>
          <Link
            href={`/reader/${document.id}`}
            className='inline-flex w-fit  items-center justify-center gap-2 bg-[#091426] py-2 px-8 text-sm leading-6 text-white transition hover:bg-[#17243a]'
          >
            Continuar Leitura
            <ArrowRight className='size-[13px]' strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function WeeklyFocusCard({ stats }: { stats: FocusStats }) {
  return (
    <article className='flex min-h-[288px] flex-col justify-between border border-[#c5c6cd] bg-[#f5f3f4] p-[25px]'>
      <header className='flex items-center gap-2'>
        <TrendingUp className='h-[17px] w-[22px] text-[#091426]' strokeWidth={2} />
        <h2 className='text-base leading-6 text-[#091426]'>Foco Semanal</h2>
      </header>
      <div className='flex items-center justify-center gap-4 py-1.5'>
        <Metric value={String(stats.pagesRead)} label='PÁGINAS LIDAS' />
        <Metric value={String(stats.reflections)} label='REFLEXÕES' />
      </div>
      <div className='border-t border-[#c5c6cd] pt-[25px]'>
        <div className='flex items-center gap-4'>
          <div className='flex h-8 flex-1 items-end justify-center gap-1 overflow-hidden rounded-brand bg-[#e4e2e3] px-1'>
            {stats.bars.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className={index >= 4 ? 'w-[21px] bg-[#091426]' : 'w-[21px] bg-[#bcc7de]'}
                style={{ height }}
              />
            ))}
          </div>
          <span className='text-xs font-bold leading-[14.4px] text-[#091426]'>{stats.deltaLabel}</span>
        </div>
        <p className='mt-[7px] text-center text-xs font-semibold leading-[14.4px] text-[#5a5f62]'>{stats.summary}</p>
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0 flex-1 text-center'>
      <p className='font-serif text-5xl font-semibold leading-[60px] text-[#091426]'>{value}</p>
      <p className='text-xs font-semibold leading-[14.4px] text-[#5a5f62]'>{label}</p>
    </div>
  )
}

export function RecentReflectionsSection({
  loading,
  onUpload,
  reflections
}: {
  loading: boolean
  onUpload: () => void
  reflections: Reflection[]
}) {
  return (
    <section className='flex flex-col gap-6'>
      <div className='flex items-end justify-between'>
        <h2 className='font-serif text-2xl font-medium leading-[33.6px] text-[#091426]'>Reflexões Recentes</h2>
        <Link
          href='/acervo'
          className='text-sm font-medium leading-[16.8px] tracking-[0.01em] text-[#091426] underline'
        >
          Ver acervo
        </Link>
      </div>
      {loading ? (
        <div className='grid gap-6 lg:grid-cols-3'>
          {[1, 2, 3].map(item => (
            <div key={item} className='min-h-[170px] animate-pulse rounded-brand border border-[#c5c6cd] bg-white' />
          ))}
        </div>
      ) : reflections.length > 0 ? (
        <div className='grid gap-6 lg:grid-cols-3'>
          {reflections.map(reflection => (
            <ReflectionCard key={reflection.id} reflection={reflection} />
          ))}
        </div>
      ) : (
        <div className='flex min-h-[170px] flex-col items-start justify-center rounded-brand border border-dashed border-[#c5c6cd] bg-white p-[25px]'>
          <p className='font-serif text-xl text-[#091426]'>Sem reflexões ainda</p>
          <p className='mt-2 max-w-xl text-sm leading-6 text-[#5a5f62]'>
            Destaques e notas criados durante a leitura aparecerão aqui automaticamente.
          </p>
          <button
            type='button'
            onClick={onUpload}
            className='mt-5 inline-flex h-10 items-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white transition hover:bg-[#17243a]'
          >
            <FileText className='size-4' />
            Enviar PDF
          </button>
        </div>
      )}
    </section>
  )
}

function ReflectionCard({ reflection }: { reflection: Reflection }) {
  const Icon = reflection.kind === 'note' ? PenLine : Quote

  return (
    <article className='flex min-h-[170px] flex-col gap-4 border border-[#c5c6cd] bg-white p-[25px]'>
      <div className='flex items-center gap-2 text-[#9a7b45]'>
        <Icon className='size-3 shrink-0' strokeWidth={1.8} />
        <span className='truncate text-xs font-medium leading-[14.4px] text-[#5a5f62]'>{reflection.source}</span>
      </div>
      <p className='line-clamp-3 min-h-[72px] text-base leading-6 text-[#091426]'>{reflection.text}</p>
      <div className='mt-auto flex items-center justify-between border-t border-[#eae7e9] pt-4'>
        <p className='line-clamp-2 text-xs font-semibold leading-[14.4px] text-[#5a5f62]'>{reflection.footer}</p>
        {reflection.bookmarked ? <Bookmark className='ml-4 size-3 shrink-0 text-[#5a5f62]' strokeWidth={1.7} /> : null}
      </div>
    </article>
  )
}
