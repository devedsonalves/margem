import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'
import type { ViewMode } from '@/features/library/model/libraryItem'

type LibraryHeaderProps = {
  documentCount: number
  loading: boolean
  query: string
  viewMode: ViewMode
  onQueryChange: (query: string) => void
  onViewModeChange: (viewMode: ViewMode) => void
}

export function LibraryHeader({
  documentCount,
  loading,
  onQueryChange,
  onViewModeChange,
  query,
  viewMode
}: LibraryHeaderProps) {
  return (
    <header className='flex flex-col gap-6 border-b border-[#c5c6cd] pb-[13px] md:flex-row md:items-end md:justify-between'>
      <div className='w-full max-w-[672px]'>
        <h1 className='font-serif text-[32px] font-normal leading-[41.6px] text-[#091426]'>Meu acervo</h1>

        <label className='mt-[14px] block'>
          <span className='block text-xs font-semibold uppercase leading-[14.4px] tracking-[0.05em] text-[#45474c]'>
            BUSCA NA BIBLIOTECA
          </span>
          <span className='mt-2 flex h-10 items-center rounded-brand border border-[#c5c6cd] bg-[#fbf8fa]'>
            <span className='flex h-full w-[33px] items-center justify-center pl-1 pr-2'>
              <Search className='size-[15px] text-[#45474c]' strokeWidth={1.8} />
            </span>
            <input
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              placeholder='Títulos, autores, documentos...'
              className='min-w-0 flex-1 bg-transparent pb-[4.8px] pt-[3px] text-lg leading-none text-[#091426] outline-none placeholder:text-[#c5c6cd]'
            />
          </span>
        </label>
      </div>

      <div className='flex flex-wrap items-center justify-end gap-4'>
        <p className='hidden text-right text-xs font-semibold uppercase leading-[14.4px] tracking-[0.05em] text-[#45474c] sm:block'>
          {loading ? 'Organizando...' : `${documentCount} documentos`}
        </p>
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        <button
          type='button'
          className='flex h-[31px] w-[90px] items-center justify-center gap-1 rounded-brand border border-[#c5c6cd] bg-[#fbf8fa] px-[13px] py-[5px] text-xs font-semibold leading-[14.4px] text-[#45474c] transition hover:border-[#091426]'
        >
          <SlidersHorizontal className='size-3' strokeWidth={1.8} />
          Filtros
        </button>
      </div>
    </header>
  )
}

function ViewModeToggle({ onChange, value }: { onChange: (value: ViewMode) => void; value: ViewMode }) {
  const options = [
    { value: 'cards', label: 'Cards', icon: LayoutGrid },
    { value: 'list', label: 'Lista', icon: List }
  ] as const

  return (
    <div
      className='flex h-[31px] items-center overflow-hidden rounded-brand border border-[#c5c6cd] bg-[#fbf8fa] p-px'
      aria-label='Modo de visualização'
      role='group'
    >
      {options.map(option => {
        const Icon = option.icon
        const active = value === option.value

        return (
          <button
            key={option.value}
            type='button'
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              'flex h-[27px] items-center justify-center gap-1.5 px-3 text-xs font-semibold leading-[14.4px] transition',
              active ? 'bg-[#091426] text-white' : 'text-[#45474c] hover:bg-[#ebe8ea] hover:text-[#091426]'
            ].join(' ')}
          >
            <Icon className='size-3.5' strokeWidth={1.8} />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
