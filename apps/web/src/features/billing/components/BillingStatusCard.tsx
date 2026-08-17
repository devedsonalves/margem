import { ArrowRight, CreditCard } from 'lucide-react'
import type { BillingOverviewDTO } from '@margem/types'
import { getPlanLabel, getStatusBadgeClass, getStatusShortLabel } from '@/features/billing/model/plans'

export function BillingStatusCard({ billing, loading }: { billing: BillingOverviewDTO | null; loading: boolean }) {
  if (loading) {
    return <div className='h-[92px] animate-pulse border border-[#c5c6cd] bg-white' />
  }

  const status = billing?.planStatus || 'FREE'

  return (
    <section className='flex flex-col gap-4 rounded-brand border border-[#c5c6cd] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
      <div className='flex min-w-0 items-center gap-4'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-brand bg-[#f0edef] text-[#091426]'>
          <CreditCard className='size-[18px]' strokeWidth={1.8} />
        </span>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2.5'>
            <p className='font-serif text-xl font-medium text-[#091426]'>
              Plano {getPlanLabel(billing?.currentPlan || 'FREE')}
            </p>
            <span className={getStatusBadgeClass(status)}>{getStatusShortLabel(status)}</span>
          </div>
          <p className='mt-1 text-sm leading-5 text-[#5a5f62]'>{getBillingDescription(billing, status)}</p>
        </div>
      </div>

      {status === 'PENDING' && billing?.pendingCheckout?.checkoutUrl ? (
        <a
          href={billing.pendingCheckout.checkoutUrl}
          className='inline-flex h-10 shrink-0 items-center justify-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white transition hover:bg-[#202a3b]'
        >
          Continuar pagamento
          <ArrowRight className='size-4' strokeWidth={1.8} />
        </a>
      ) : null}
    </section>
  )
}

function getBillingDescription(billing: BillingOverviewDTO | null, status: BillingOverviewDTO['planStatus']) {
  if (billing?.expiresAt) {
    return `Assinatura ativa até ${new Date(billing.expiresAt).toLocaleDateString('pt-BR')}.`
  }
  if (status === 'PENDING') {
    return 'Finalize o pagamento para ativar os recursos Premium.'
  }
  if (status === 'PAST_DUE') {
    return 'Regularize o pagamento para manter os recursos Premium.'
  }
  return 'Recursos essenciais disponíveis sem cobrança.'
}
