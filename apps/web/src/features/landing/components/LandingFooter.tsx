import Link from 'next/link'
import { ArrowRight, BookOpenText } from 'lucide-react'
import { BrandLogo } from '@/shared/ui/BrandLogo'

export function FinalCtaSection() {
  return (
    <section className='bg-[#091426] px-5 py-20 text-white sm:px-8 md:py-24 lg:px-10'>
      <div className='mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
            Sua próxima leitura começa aqui
          </p>
          <h2 className='mt-4 max-w-2xl font-serif text-[36px] font-medium leading-[1.16] sm:text-[48px]'>
            Dê espaço ao que suas leituras despertam.
          </h2>
          <p className='mt-5 max-w-xl text-base leading-7 text-white/70'>
            Reúna textos, destaques e reflexões em um ambiente construído para transformar leitura em repertório.
          </p>
          <div className='mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
            <Link
              href='/cadastro'
              className='inline-flex h-12 items-center gap-2 bg-white px-6 text-sm font-semibold text-[#091426] transition-colors hover:bg-[#f0edef]'
            >
              Criar conta grátis
              <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
            </Link>
            <Link
              href='/login'
              className='text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline'
            >
              Já tenho uma conta
            </Link>
          </div>
        </div>

        <div className='border-l border-white/20 pl-7 sm:pl-10'>
          <BookOpenText className='size-6 text-[#e72d31]' strokeWidth={1.6} aria-hidden='true' />
          <p className='mt-8 max-w-md font-serif text-2xl italic leading-9 text-white/90 sm:text-[28px]'>
            Uma boa leitura não termina na última página. Ela continua nas ideias que você decide guardar.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='border-t border-[#c5c6cd] bg-white px-5 py-10 sm:px-8 lg:px-10'>
      <div className='mx-auto flex max-w-[1200px] flex-col gap-8 md:flex-row md:items-center md:justify-between'>
        <Link href='/' className='block w-[140px]' aria-label='Margem - página inicial'>
          <BrandLogo />
        </Link>

        <nav className='flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#5a5f62]' aria-label='Navegação do rodapé'>
          <Link href='#recursos' className='transition-colors hover:text-[#091426]'>
            Recursos
          </Link>
          <Link href='#acervo' className='transition-colors hover:text-[#091426]'>
            Acervo
          </Link>
          <Link href='#planos' className='transition-colors hover:text-[#091426]'>
            Planos
          </Link>
          <Link href='/login' className='transition-colors hover:text-[#091426]'>
            Entrar
          </Link>
        </nav>

        <p className='text-xs leading-5 text-[#75777d]'>© {currentYear} Margem. Leitura que permanece.</p>
      </div>
    </footer>
  )
}
