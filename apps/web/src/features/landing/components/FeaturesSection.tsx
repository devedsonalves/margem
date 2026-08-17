import { BookOpenText, Highlighter, NotebookPen, Quote } from 'lucide-react'

const readingFlow = [
  {
    icon: BookOpenText,
    number: '01',
    title: 'Leia sem ruído',
    text: 'Uma experiência limpa para acompanhar o texto no seu ritmo.'
  },
  {
    icon: Highlighter,
    number: '02',
    title: 'Destaque o essencial',
    text: 'Marcações organizadas por cor, página e contexto.'
  },
  {
    icon: NotebookPen,
    number: '03',
    title: 'Desenvolva suas ideias',
    text: 'Notas e citações reunidas em um caderno que acompanha a leitura.'
  }
]

export function FeaturesSection() {
  return (
    <section
      id='recursos'
      className='scroll-mt-20 border-y border-[#c5c6cd] bg-[#f5f3f4] px-5 py-20 sm:px-8 md:py-28 lg:px-10'
    >
      <div className='mx-auto max-w-[1200px]'>
        <header className='grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Do texto à reflexão</p>
            <h2 className='mt-3 max-w-xl font-serif text-[34px] font-medium leading-[1.18] text-[#091426] sm:text-[42px]'>
              Um fluxo contínuo para leituras que pedem atenção.
            </h2>
          </div>
          <p className='max-w-xl text-base leading-7 text-[#5a5f62] lg:ml-auto'>
            O Margem mantém documento, destaques e anotações próximos. Você preserva o contexto de cada ideia sem
            interromper a leitura.
          </p>
        </header>

        <ol className='mt-12 grid border-y border-[#c5c6cd] md:grid-cols-3'>
          {readingFlow.map((item, index) => {
            const Icon = item.icon

            return (
              <li
                key={item.number}
                className={[
                  'relative px-0 py-7 md:px-7 md:py-8',
                  index > 0 ? 'border-t border-[#c5c6cd] md:border-l md:border-t-0' : ''
                ].join(' ')}
              >
                <div className='flex items-center justify-between'>
                  <Icon className='size-5 text-[#091426]' strokeWidth={1.7} aria-hidden='true' />
                  <span className='font-serif text-sm italic text-[#9a9ca1]'>{item.number}</span>
                </div>
                <h3 className='mt-7 font-serif text-2xl font-medium text-[#091426]'>{item.title}</h3>
                <p className='mt-2 max-w-sm text-sm leading-6 text-[#5a5f62]'>{item.text}</p>
              </li>
            )
          })}
        </ol>

        <article className='mt-12 overflow-hidden border border-[#c5c6cd] bg-white lg:grid lg:grid-cols-[0.78fr_1.22fr]'>
          <div className='flex flex-col justify-center p-7 sm:p-10 lg:p-12'>
            <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Leitura conectada</p>
            <h3 className='mt-3 font-serif text-[30px] font-medium leading-[1.2] text-[#091426] sm:text-[36px]'>
              Cada anotação continua ligada à página que a originou.
            </h3>
            <p className='mt-5 text-base leading-7 text-[#5a5f62]'>
              Retome o raciocínio com a citação, a página e a sua interpretação reunidas no mesmo lugar.
            </p>
            <div className='mt-8 flex items-start gap-3 border-t border-[#e4e2e3] pt-6'>
              <Quote className='mt-1 size-4 shrink-0 text-[#e72d31]' strokeWidth={1.8} aria-hidden='true' />
              <p className='font-serif text-lg italic leading-7 text-[#45474c]'>
                A margem deixa de ser espaço vazio e passa a guardar o percurso da leitura.
              </p>
            </div>
          </div>

          <ReaderPreview />
        </article>
      </div>
    </section>
  )
}

function ReaderPreview() {
  return (
    <div className='min-h-[450px] bg-[#091426] p-5 sm:p-8 lg:p-10'>
      <div className='mx-auto flex h-full min-h-[390px] max-w-[650px] flex-col overflow-hidden rounded-brand border border-white/20 bg-[#f5f3f4] shadow-[0_24px_70px_rgba(0,0,0,.24)]'>
        <div className='flex h-11 shrink-0 items-center justify-between border-b border-[#c5c6cd] bg-white px-4'>
          <div className='flex items-center gap-2'>
            <span className='size-2 rounded-full bg-[#e72d31]' />
            <span className='text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5a5f62]'>A República</span>
          </div>
          <span className='text-[10px] text-[#75777d]'>p. 42 de 318</span>
        </div>

        <div className='grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_112px] sm:grid-cols-[minmax(0,1fr)_180px]'>
          <div className='flex items-center justify-center overflow-hidden p-4 sm:p-6'>
            <div className='h-full max-h-[315px] w-full max-w-[290px] overflow-hidden bg-white px-6 py-7 shadow-[0_8px_28px_rgba(9,20,38,.12)] sm:px-9'>
              <p className='font-serif text-[9px] uppercase tracking-[0.18em] text-[#9a9ca1]'>Livro VII</p>
              <h4 className='mt-4 font-serif text-lg font-medium text-[#091426]'>A alegoria da caverna</h4>
              <div className='mt-5 space-y-2 font-serif text-[9px] leading-[1.65] text-[#5a5f62]'>
                <p>Imagina homens em uma morada subterrânea, em forma de caverna, cuja entrada se abre para a luz.</p>
                <p className='bg-[#fadfb8] px-1 text-[#091426]'>
                  A educação não é o que alguns proclamam que ela é, como se introduzissem ciência numa alma.
                </p>
                <p>É necessário voltar o olhar para aquilo que cada coisa verdadeiramente revela.</p>
              </div>
            </div>
          </div>

          <aside className='border-l border-[#c5c6cd] bg-white p-3 sm:p-5' aria-label='Prévia do caderno'>
            <p className='text-[9px] font-semibold uppercase tracking-[0.12em] text-[#75777d]'>Caderno</p>
            <p className='mt-4 font-serif text-sm leading-5 text-[#091426]'>
              Conhecimento como mudança de perspectiva.
            </p>
            <div className='mt-4 border-l-2 border-[#e72d31] pl-3'>
              <p className='text-[9px] leading-4 text-[#5a5f62]'>
                A leitura transforma quando modifica a forma de olhar.
              </p>
            </div>
            <div className='mt-5 flex flex-wrap gap-1.5'>
              <span className='size-3 rounded-full bg-[#fadfb8]' />
              <span className='size-3 rounded-full bg-[#d8e3fb]' />
              <span className='size-3 rounded-full bg-[#ffdad6]' />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
