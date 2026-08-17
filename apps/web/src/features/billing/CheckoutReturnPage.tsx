'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useCheckoutReturn } from '@/features/billing/useCheckoutReturn'

export default function CheckoutReturnPage() {
  const { billing, loading } = useCheckoutReturn()

  const status = billing?.planStatus || 'PENDING'
  const isActive = status === 'ACTIVE'
  const isCanceled = status === 'CANCELED'
  const checkoutUrl = billing?.pendingCheckout?.checkoutUrl
  const Icon = isActive ? CheckCircle2 : isCanceled ? XCircle : Clock3

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#fbf8fa] px-5 py-16 text-[#091426]'>
      <section className='w-full max-w-[620px] rounded-brand border border-[#c5c6cd] bg-white p-8 text-center'>
        <Icon className='mx-auto mb-5 size-12 text-[#091426]' strokeWidth={1.6} />
        <p className='mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Retorno do checkout</p>
        <h1 className='font-serif text-[34px] font-medium leading-[40px]'>
          {isActive ? 'Plano ativo' : isCanceled ? 'Checkout nao concluido' : 'Aguardando confirmacao do Asaas'}
        </h1>
        <p className='mx-auto mt-4 max-w-[460px] text-base leading-6 text-[#5a5f62]'>
          {isActive
            ? 'O webhook confirmou o pagamento e o seu plano ja foi ativado.'
            : 'Algumas formas de pagamento podem levar alguns instantes para confirmar. Esta pagina atualiza automaticamente.'}
        </p>

        <div className='mt-8 rounded-brand border border-[#e4e2e3] bg-[#f5f3f4] p-4 text-left text-sm leading-6 text-[#45474c]'>
          {loading ? 'Consultando assinatura...' : `Status atual: ${status}`}
        </div>

        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
          {!isActive && checkoutUrl ? (
            <a
              href={checkoutUrl}
              className='inline-flex h-12 items-center justify-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white'
            >
              Continuar pagamento
              <ArrowRight className='size-4' strokeWidth={1.8} />
            </a>
          ) : null}
          <Link
            href='/planos'
            className='inline-flex h-12 items-center justify-center gap-2 border border-[#091426] px-5 text-sm font-medium text-[#091426]'
          >
            <ArrowLeft className='size-4' strokeWidth={1.8} />
            Ver planos
          </Link>
          <Link
            href='/inicio'
            className={[
              'inline-flex h-12 items-center justify-center px-5 text-sm font-medium',
              !isActive && checkoutUrl ? 'border border-[#c5c6cd] text-[#091426]' : 'bg-[#091426] text-white'
            ].join(' ')}
          >
            Ir para inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
