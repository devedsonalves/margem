'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CalendarDays, CreditCard, XCircle } from 'lucide-react'
import type { AuthUser } from '@/features/auth/model/types'
import { getPlanLabel, getStatusBadgeClass, getStatusShortLabel } from '@/features/billing/model/plans'
import { CancelSubscriptionDialog } from '@/features/settings/components/CancelSubscriptionDialog'
import { SectionHeader } from '@/features/settings/components/ProfileSettingsSection'

export function PlanSettingsSection({
  loading,
  onCancel,
  user
}: {
  loading: boolean
  onCancel: () => Promise<{ message: string }>
  user: AuthUser | null
}) {
  const plan = user?.currentPlan ?? 'FREE'
  const status = user?.planStatus ?? 'FREE'
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const canCancel = plan !== 'FREE' || status === 'PENDING'

  return (
    <section id='assinatura' className='scroll-mt-24'>
      <SectionHeader title='Assinatura' description='Consulte seu plano atual e gerencie os recursos disponíveis.' />

      {loading ? (
        <div className='mt-7 h-28 animate-pulse rounded-brand bg-[#e4e2e3]' />
      ) : (
        <div className='mt-7 border-y border-[#e4e2e3]'>
          <div className='flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-brand bg-[#f0edef] text-[#091426]'>
                <CreditCard className='size-5' strokeWidth={1.7} aria-hidden='true' />
              </div>
              <div>
                <div className='flex flex-wrap items-center gap-3'>
                  <p className='font-serif text-xl font-medium text-[#091426]'>Plano {getPlanLabel(plan)}</p>
                  <span className={getStatusBadgeClass(status)}>{getStatusShortLabel(status)}</span>
                </div>
                <p className='mt-1 text-sm leading-5 text-[#5a5f62]'>
                  {plan === 'PREMIUM'
                    ? 'Recursos completos para acervo, destaques e exportações.'
                    : 'Recursos essenciais para iniciar sua rotina de leitura.'}
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Link
                href='/planos'
                className='inline-flex h-10 w-fit items-center gap-2 border border-[#091426] px-4 text-sm font-medium text-[#091426] transition hover:bg-[#ebe8ea]'
              >
                Gerenciar plano
                <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
              </Link>
              {canCancel ? (
                <button
                  type='button'
                  onClick={() => setCancelDialogOpen(true)}
                  className='inline-flex h-10 items-center gap-2 border border-[#8f1d2c] px-4 text-sm font-medium text-[#8f1d2c] transition hover:bg-[#fff1f1]'
                >
                  <XCircle className='size-4' strokeWidth={1.8} aria-hidden='true' />
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>

          <div className='flex items-center gap-3 border-t border-[#e4e2e3] py-4 text-sm text-[#5a5f62]'>
            <CalendarDays className='size-4 shrink-0 text-[#091426]' strokeWidth={1.7} aria-hidden='true' />
            <span>Membro desde {formatMemberSince(user?.createdAt)}</span>
          </div>
        </div>
      )}

      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onCancel={onCancel}
      />
    </section>
  )
}

function formatMemberSince(value?: string) {
  if (!value) return 'o primeiro acesso'

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(value))
}
