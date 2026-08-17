import { ArrowRight, Check, Loader2 } from 'lucide-react'
import type { BillingOverviewDTO, PlanCode } from '@margem/types'
import { planPageFeatures, type MarketingPlan } from '@/features/billing/model/plans'

type PlanCardProps = {
  billing: BillingOverviewDTO | null
  checkoutPlan: PlanCode | null
  plan: MarketingPlan
  onCheckout: (plan: PlanCode) => void
}

export function PlanCard({ billing, checkoutPlan, onCheckout, plan }: PlanCardProps) {
  const currentPlan = billing?.currentPlan || 'FREE'
  const status = billing?.planStatus || 'FREE'
  const isFree = plan.code === 'FREE'
  const isPremium = plan.code === 'PREMIUM'
  const isCurrent = currentPlan === plan.code && (status === 'ACTIVE' || (isFree && status === 'FREE'))
  const isPending = currentPlan === plan.code && status === 'PENDING'
  const isLoading = checkoutPlan === plan.code

  return (
    <article
      className={[
        'relative flex min-h-[410px] flex-col border bg-white p-6 sm:p-7',
        isPremium ? 'border-[#091426]' : 'border-[#c5c6cd]'
      ].join(' ')}
    >
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[#75777d]'>
            {isFree ? 'Para começar' : 'Para ir além'}
          </p>
          <h2 className='mt-2 font-serif text-[28px] font-medium leading-9 text-[#091426]'>{plan.name}</h2>
        </div>
        {isPremium ? (
          <span className='shrink-0 rounded-brand bg-[#091426] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white'>
            Recomendado
          </span>
        ) : null}
      </div>

      <p className='mt-3 min-h-[40px] max-w-md text-sm leading-5 text-[#5a5f62]'>{plan.description}</p>

      <p className='mt-7 flex items-baseline gap-2 text-[#091426]'>
        <span className='font-serif text-[40px] font-semibold leading-none'>{plan.priceLabel}</span>
        {plan.priceSuffix ? <span className='text-sm text-[#5a5f62]'>{plan.priceSuffix}</span> : null}
      </p>

      <ul className='mt-7 flex flex-col gap-3 border-t border-[#e4e2e3] pt-6'>
        {planPageFeatures[plan.code].map(feature => (
          <li key={feature} className='grid grid-cols-[16px_minmax(0,1fr)] gap-3 text-sm leading-5 text-[#45474c]'>
            <Check className='mt-0.5 size-4 text-[#091426]' strokeWidth={2} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className='mt-auto pt-7'>
        <PlanAction
          billing={billing}
          isCurrent={isCurrent}
          isFree={isFree}
          isLoading={isLoading}
          isPending={isPending}
          plan={plan}
          onCheckout={onCheckout}
        />
      </div>
    </article>
  )
}

type PlanActionProps = Pick<PlanCardProps, 'billing' | 'onCheckout' | 'plan'> & {
  isCurrent: boolean
  isFree: boolean
  isLoading: boolean
  isPending: boolean
}

function PlanAction({ billing, isCurrent, isFree, isLoading, isPending, onCheckout, plan }: PlanActionProps) {
  if (isCurrent) {
    return (
      <div className='flex h-12 w-full items-center justify-center gap-2 rounded-brand border border-[#091426] bg-[#f5f3f4] px-4 text-sm font-medium text-[#091426]'>
        <Check className='size-4' strokeWidth={2} />
        Seu plano atual
      </div>
    )
  }

  if (isPending && billing?.pendingCheckout?.checkoutUrl) {
    return (
      <a
        href={billing.pendingCheckout.checkoutUrl}
        className='flex h-12 w-full items-center justify-center gap-2 bg-[#091426] px-4 text-sm font-medium text-white transition hover:bg-[#202a3b]'
      >
        Continuar pagamento
        <ArrowRight className='size-4' strokeWidth={1.8} />
      </a>
    )
  }

  if (isPending || isFree) {
    return (
      <div className='flex h-12 w-full items-center justify-center rounded-brand border border-[#c5c6cd] px-4 text-sm font-medium text-[#75777d]'>
        {isPending ? 'Aguardando confirmação' : 'Plano gratuito'}
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={() => onCheckout(plan.code)}
      disabled={isLoading}
      className='flex h-12 w-full items-center justify-center gap-2 bg-[#091426] px-4 text-sm font-medium text-white transition hover:bg-[#202a3b] disabled:cursor-not-allowed disabled:opacity-70'
    >
      {isLoading ? <Loader2 className='size-4 animate-spin' /> : null}
      {isLoading ? 'Abrindo checkout' : plan.ctaLabel}
      {!isLoading ? <ArrowRight className='size-4' strokeWidth={1.8} /> : null}
    </button>
  )
}
