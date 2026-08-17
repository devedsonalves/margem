'use client'

import type { PlanCode } from '@margem/types'
import { ShieldCheck } from 'lucide-react'
import { AppShell } from '@/features/shell/components/AppShell'
import { BillingStatusCard } from '@/features/billing/components/BillingStatusCard'
import { PlanCard } from '@/features/billing/components/PlanCard'
import { marketingPlans } from '@/features/billing/model/plans'
import { useBilling } from '@/features/billing/useBilling'

export default function PlansPage() {
  const billingState = useBilling()

  const handleCheckout = async (plan: PlanCode) => {
    try {
      await billingState.startCheckout(plan)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível iniciar o checkout.')
    }
  }

  return (
    <AppShell
      activeItem='planos'
      uploading={billingState.uploading}
      onLogout={billingState.logout}
      onUpload={billingState.uploadDocument}
    >
      <div className='flex w-full flex-col gap-8'>
        <header className='border-b border-[#c5c6cd] pb-6'>
          <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[#75777d]'>Conta e assinatura</p>
          <h1 className='mt-2 font-serif text-[34px] font-medium leading-[42px] text-[#091426]'>Planos</h1>
          <p className='mt-2 max-w-xl text-base leading-6 text-[#5a5f62]'>
            Escolha os recursos que fazem sentido para a sua rotina de leitura.
          </p>
        </header>

        <BillingStatusCard billing={billingState.billing} loading={billingState.loading} />

        {billingState.loading ? (
          <div className='grid gap-6 lg:grid-cols-2'>
            {[1, 2].map(item => (
              <div key={item} className='h-[410px] animate-pulse rounded-brand border border-[#c5c6cd] bg-white' />
            ))}
          </div>
        ) : (
          <section className='grid gap-6 lg:grid-cols-2'>
            {marketingPlans.map(plan => (
              <PlanCard
                key={plan.code}
                billing={billingState.billing}
                checkoutPlan={billingState.checkoutPlan}
                onCheckout={handleCheckout}
                plan={plan}
              />
            ))}
          </section>
        )}

        <div className='flex items-start gap-3 border-t border-[#c5c6cd] pt-5 text-sm leading-5 text-[#5a5f62]'>
          <ShieldCheck className='mt-0.5 size-4 shrink-0 text-[#091426]' strokeWidth={1.8} />
          <p>Pagamento processado com segurança pelo Asaas. A ativação acontece automaticamente após a confirmação.</p>
        </div>
      </div>
    </AppShell>
  )
}
