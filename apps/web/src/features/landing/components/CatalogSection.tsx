import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const catalogBooks = [
  { title: 'O Processo', author: 'Franz Kafka', cover: '/figma/landing/catalog-1.png' },
  { title: 'Meditações', author: 'Marco Aurélio', cover: '/figma/landing/catalog-2.png' },
  { title: 'A República', author: 'Platão', cover: '/figma/landing/catalog-3.png' },
  { title: 'Ética a Nicômaco', author: 'Aristóteles', cover: '/figma/landing/catalog-4.png' }
]

export function CatalogSection() {
  return (
    <section
      id='acervo'
      className='scroll-mt-20 border-b border-[#c5c6cd] bg-white px-5 py-20 sm:px-8 md:py-28 lg:px-10'
    >
      <div className='mx-auto max-w-[1200px]'>
        <header className='flex flex-col gap-6 border-b border-[#c5c6cd] pb-8 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Acervo Margem</p>
            <h2 className='mt-3 max-w-2xl font-serif text-[34px] font-medium leading-[1.18] text-[#091426] sm:text-[42px]'>
              Grandes ideias merecem permanecer ao alcance.
            </h2>
          </div>
          <p className='max-w-md text-base leading-7 text-[#5a5f62] md:text-right'>
            Obras essenciais para começar, além dos documentos que você leva para a sua própria biblioteca.
          </p>
        </header>

        <div className='mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4'>
          {catalogBooks.map((book, index) => (
            <article key={book.title} className='group min-w-0'>
              <div className='relative aspect-[0.68] overflow-hidden border border-[#c5c6cd] bg-[#e4e2e3] shadow-[0_10px_28px_rgba(9,20,38,.08)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(9,20,38,.14)]'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={book.cover} alt={`Capa de ${book.title}`} className='h-full w-full object-cover' />
              </div>
              <div className='mt-4 flex items-start gap-3'>
                <span className='pt-1 font-serif text-xs italic text-[#9a9ca1]'>0{index + 1}</span>
                <div className='min-w-0'>
                  <h3 className='font-serif text-lg font-medium leading-6 text-[#091426]'>{book.title}</h3>
                  <p className='mt-0.5 text-xs leading-5 text-[#5a5f62]'>{book.author}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className='mt-12 flex flex-col gap-5 border-t border-[#c5c6cd] pt-7 sm:flex-row sm:items-center sm:justify-between'>
          <p className='max-w-xl font-serif text-lg italic leading-7 text-[#45474c]'>
            Filosofia, literatura, ensaio e todos os PDFs que acompanham a sua trajetória.
          </p>
          <Link
            href='/cadastro'
            className='inline-flex h-11 w-fit items-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white transition-colors hover:bg-[#17243a]'
          >
            Explorar o acervo
            <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
          </Link>
        </div>
      </div>
    </section>
  )
}
