import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/shared/ui/BrandLogo'

type AuthVariant = 'login' | 'register'

const editorialContent: Record<AuthVariant, { eyebrow: string; quote: string; caption: string }> = {
  login: {
    eyebrow: 'Retome sua leitura',
    quote: 'As ideias continuam de onde você parou.',
    caption: 'Documento, margem e caderno permanecem conectados.'
  },
  register: {
    eyebrow: 'Comece sua biblioteca',
    quote: 'Toda leitura merece um espaço para permanecer.',
    caption: 'Organize o que lê e preserve o caminho de cada reflexão.'
  }
}

export function AuthShell({ children, variant }: { children: ReactNode; variant: AuthVariant }) {
  const content = editorialContent[variant]
  const panelTitleId = `${variant}-editorial-title`

  return (
    <main className='min-h-screen bg-white text-[#091426] lg:grid lg:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]'>
      <aside
        className='relative hidden overflow-hidden bg-[#091426] md:block md:h-[280px] lg:sticky lg:top-0 lg:h-screen'
        aria-labelledby={panelTitleId}
      >
        <Image
          src='/auth/auth-reading-desk.png'
          alt=''
          fill
          priority
          sizes='(min-width: 1024px) 45vw, 100vw'
          className='object-cover object-[50%_68%] lg:object-center'
        />
        <div className='absolute inset-0 bg-[#091426]/35' />
        <div className='absolute inset-x-0 top-0 max-w-xl p-10 text-white lg:p-12 xl:p-16'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-white/65'>{content.eyebrow}</p>
          <h2 id={panelTitleId} className='mt-4 font-serif text-[34px] font-medium leading-[1.16] lg:text-[42px]'>
            {content.quote}
          </h2>
          <p className='mt-5 max-w-md text-sm leading-6 text-white/70'>{content.caption}</p>
        </div>
        <div className='absolute bottom-10 left-10 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 lg:bottom-12 lg:left-12 xl:left-16'>
          <span className='h-px w-12 bg-[#e72d31]' />
          Leitura que permanece
        </div>
      </aside>

      <section className='flex min-h-screen items-center bg-white px-5 py-8 sm:px-10 md:min-h-[calc(100vh-280px)] md:py-14 lg:min-h-screen lg:px-16 xl:px-24'>
        <div className='mx-auto w-full max-w-[460px]'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm font-medium text-[#5a5f62] transition-colors hover:text-[#091426]'
          >
            <ArrowLeft className='size-4' strokeWidth={1.8} aria-hidden='true' />
            Voltar para o início
          </Link>

          <div className='mt-10 w-[158px] sm:mt-14'>
            <BrandLogo />
          </div>

          <div className='mt-10'>{children}</div>
        </div>
      </section>
    </main>
  )
}
