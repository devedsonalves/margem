import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { marketingPlans, planPageFeatures } from '@/features/billing/model/plans'

export function PricingSection() {
  return (
    <section
      id='planos'
      className='scroll-mt-20 border-b border-[#c5c6cd] bg-[#f5f3f4] px-5 py-20 sm:px-8 md:py-28 lg:px-10'
    >
      <div className='mx-auto max-w-[1200px]'>
        <header className='mx-auto max-w-2xl text-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Planos</p>
          <h2 className='mt-3 font-serif text-[34px] font-medium leading-[1.18] text-[#091426] sm:text-[42px]'>
            Comece no seu ritmo. Aprofunde quando precisar.
          </h2>
          <p className='mx-auto mt-4 max-w-xl text-base leading-7 text-[#5a5f62]'>
            Recursos essenciais para organizar leituras, com espaço para expandir seu acervo e suas anotações.
          </p>
        </header>

        <div className='mx-auto mt-12 grid max-w-[960px] gap-6 md:grid-cols-2'>
          {marketingPlans.map(plan => (
            <article
              key={plan.code}
              className={[
                'relative flex min-h-[500px] flex-col border bg-white p-7 sm:p-9',
                plan.recommended ? 'border-[#091426] shadow-[0_16px_40px_rgba(9,20,38,.10)]' : 'border-[#c5c6cd]'
              ].join(' ')}
            >
              {plan.recommended ? (
                <span className='absolute right-7 top-7 rounded-brand bg-[#091426] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white sm:right-9 sm:top-9'>
                  Recomendado
                </span>
              ) : null}

              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[#75777d]'>
                {plan.code === 'FREE' ? 'Para começar' : 'Para ir além'}
              </p>
              <h3 className='mt-3 font-serif text-[30px] font-medium text-[#091426]'>{plan.name}</h3>
              <p className='mt-2 min-h-12 max-w-sm text-sm leading-6 text-[#5a5f62]'>{plan.description}</p>

              <p className='mt-7 flex items-end text-[#091426]'>
                <span className='font-serif text-[42px] font-semibold leading-none'>{plan.priceLabel}</span>
                {plan.priceSuffix ? <span className='mb-1 ml-1 text-sm text-[#5a5f62]'>{plan.priceSuffix}</span> : null}
              </p>

              <ul className='mt-7 flex-1 space-y-3 border-t border-[#e4e2e3] pt-6 text-sm leading-5 text-[#45474c]'>
                {planPageFeatures[plan.code].map(item => (
                  <li key={item} className='flex items-start gap-3'>
                    <Check className='mt-0.5 size-4 shrink-0 text-[#091426]' strokeWidth={1.8} aria-hidden='true' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href='/cadastro'
                className={[
                  'mt-8 flex h-12 items-center justify-center gap-2 px-5 text-sm font-medium transition-colors',
                  plan.recommended
                    ? 'bg-[#091426] text-white hover:bg-[#17243a]'
                    : 'border border-[#091426] text-[#091426] hover:bg-[#ebe8ea]'
                ].join(' ')}
              >
                {plan.ctaLabel}
                <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
              </Link>
            </article>
          ))}
        </div>

        <div className='mx-auto mt-7 flex max-w-[960px] items-start justify-center gap-3 text-center text-sm leading-5 text-[#5a5f62]'>
          <ShieldCheck className='mt-0.5 size-4 shrink-0 text-[#091426]' strokeWidth={1.8} aria-hidden='true' />
          <p>Pagamento processado com segurança pelo Asaas. A ativação acontece após a confirmação.</p>
        </div>
      </div>
    </section>
  )
}
