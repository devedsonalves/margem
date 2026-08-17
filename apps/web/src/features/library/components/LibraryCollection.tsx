import Link from 'next/link'
import { BookOpen, Clock3, Loader2, Plus, Trash2 } from 'lucide-react'
import { PdfCover } from '@/features/library/components/PdfCover'
import type { LibraryItem, ViewMode } from '@/features/library/model/libraryItem'

type LibraryCollectionProps = {
  deletingDocumentId: string | null
  items: LibraryItem[]
  loading: boolean
  viewMode: ViewMode
  onDelete: (item: LibraryItem) => void
  onUpload: () => void
}

export function LibraryCollection({
  deletingDocumentId,
  items,
  loading,
  onDelete,
  onUpload,
  viewMode
}: LibraryCollectionProps) {
  if (loading) return <LibrarySkeleton viewMode={viewMode} />
  if (items.length === 0) return <EmptyLibrary onUpload={onUpload} />

  if (viewMode === 'list') {
    return (
      <div className='divide-y divide-[#c5c6cd] overflow-hidden rounded-brand border border-[#c5c6cd]'>
        {items.map(item => (
          <DocumentListItem key={item.id} item={item} deleting={deletingDocumentId === item.id} onDelete={onDelete} />
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map(item => (
        <DocumentCard key={item.id} item={item} deleting={deletingDocumentId === item.id} onDelete={onDelete} />
      ))}
    </div>
  )
}

function LibrarySkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className='divide-y divide-[#c5c6cd] overflow-hidden rounded-brand border border-[#c5c6cd]'>
        {[1, 2, 3, 4].map(item => (
          <div key={item} className='flex h-[88px] animate-pulse items-center gap-4 bg-[#f5f3f4] px-3'>
            <div className='h-14 w-10 bg-[#e4e2e3]' />
            <div className='flex-1 space-y-3'>
              <div className='h-4 w-2/5 bg-[#e4e2e3]' />
              <div className='h-3 w-1/4 bg-[#e4e2e3]' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4'>
      {[1, 2, 3, 4].map(item => (
        <div key={item} className='h-[384px] animate-pulse rounded-brand border border-[#c5c6cd] bg-[#f5f3f4]' />
      ))}
    </div>
  )
}

function DocumentCard({
  deleting,
  item,
  onDelete
}: {
  deleting: boolean
  item: LibraryItem
  onDelete: (item: LibraryItem) => void
}) {
  return (
    <article className='group overflow-hidden border border-[#c5c6cd] bg-[#fbf8fa] transition duration-300 hover:border-[#091426]'>
      <Link href={item.href} className='block'>
        <div className='border-b border-[#c5c6cd] bg-[#f5f3f4] p-px'>
          <PdfCover documentId={item.id} title={item.title} />
        </div>
        <div className='p-4 pb-0'>
          <h2 className='line-clamp-2 font-serif text-xl font-normal leading-[25px] text-[#091426]'>{item.title}</h2>
          <p className='mt-1 truncate text-sm leading-5 text-[#45474c]'>{item.description}</p>
        </div>
      </Link>

      <div className='mx-4 mt-4 flex min-h-[45px] items-center justify-between gap-3 border-t border-[#eae7e9] py-3 text-xs font-semibold leading-[14.4px] text-[#5a5f62]'>
        <Link href={item.href} className='min-w-0 flex-1'>
          <span className='flex min-w-0 items-center gap-1.5'>
            <Clock3 className='size-3 shrink-0' />
            <span className='truncate'>{item.progress}</span>
          </span>
        </Link>
        <span className='hidden shrink-0 sm:inline'>{item.addedAt}</span>
        <DeleteButton deleting={deleting} item={item} onDelete={onDelete} />
      </div>
    </article>
  )
}

function DocumentListItem({
  deleting,
  item,
  onDelete
}: {
  deleting: boolean
  item: LibraryItem
  onDelete: (item: LibraryItem) => void
}) {
  return (
    <article className='group grid min-h-[92px] grid-cols-[56px_minmax(0,1fr)] items-center gap-4 rounded-none bg-[#fbf8fa] px-3 py-3 transition hover:bg-[#f5f3f4] sm:grid-cols-[56px_minmax(0,1fr)_140px_150px_40px]'>
      <Link
        href={item.href}
        className='block overflow-hidden border border-[#c5c6cd] bg-[#f5f3f4]'
        aria-label={`Abrir ${item.title}`}
      >
        <PdfCover documentId={item.id} title={item.title} />
      </Link>
      <Link href={item.href} className='min-w-0'>
        <h2 className='truncate font-serif text-xl font-normal leading-[25px] text-[#091426]'>{item.title}</h2>
        <p className='mt-1 truncate text-sm leading-5 text-[#45474c]'>{item.description}</p>
      </Link>
      <Link
        href={item.href}
        className='col-start-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-[14.4px] text-[#5a5f62] sm:col-start-auto'
      >
        <Clock3 className='size-3 shrink-0' />
        <span className='truncate'>{item.progress}</span>
      </Link>
      <span className='hidden truncate text-right text-xs font-semibold leading-[14.4px] text-[#5a5f62] sm:block'>
        {item.addedAt}
      </span>
      <div className='col-start-2 justify-self-start sm:col-start-auto sm:justify-self-end'>
        <DeleteButton deleting={deleting} item={item} onDelete={onDelete} />
      </div>
    </article>
  )
}

function DeleteButton({
  deleting,
  item,
  onDelete
}: {
  deleting: boolean
  item: LibraryItem
  onDelete: (item: LibraryItem) => void
}) {
  return (
    <button
      type='button'
      disabled={deleting}
      onClick={() => onDelete(item)}
      aria-label={`Excluir ${item.title}`}
      title='Excluir PDF'
      className='flex size-8 shrink-0 items-center justify-center text-[#75777d] transition hover:bg-[#f0e6e8] hover:text-[#8f1d2c] disabled:cursor-not-allowed disabled:opacity-60'
    >
      {deleting ? (
        <Loader2 className='size-4 animate-spin' strokeWidth={1.8} />
      ) : (
        <Trash2 className='size-4' strokeWidth={1.8} />
      )}
    </button>
  )
}

function EmptyLibrary({ onUpload }: { onUpload: () => void }) {
  return (
    <div className='flex min-h-[360px] flex-col items-center justify-center rounded-brand border border-dashed border-[#c5c6cd] px-6 text-center'>
      <BookOpen className='mb-5 size-10 text-[#091426]' />
      <h2 className='font-serif text-2xl text-[#091426]'>Seu acervo está vazio</h2>
      <p className='mt-2 max-w-sm text-sm leading-6 text-[#5a5f62]'>
        Envie um PDF para começar a organizar leituras e anotações no Margem.
      </p>
      <button
        type='button'
        onClick={onUpload}
        className='mt-6 flex h-10 items-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white transition hover:bg-[#17243a]'
      >
        <Plus className='size-4' />
        Novo Documento
      </button>
    </div>
  )
}
