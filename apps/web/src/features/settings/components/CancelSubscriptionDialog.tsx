'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, LoaderCircle, X } from 'lucide-react'
import { SettingsFeedback } from '@/features/settings/components/SettingsFormControls'
import type { SettingsFeedbackState } from '@/features/settings/model/types'

export function CancelSubscriptionDialog({
  onCancel,
  onClose,
  open
}: {
  onCancel: () => Promise<{ message: string }>
  onClose: () => void
  open: boolean
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [canceling, setCanceling] = useState(false)
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const close = () => {
    if (canceling) return
    setFeedback(null)
    onClose()
  }

  const confirmCancellation = async () => {
    setCanceling(true)
    setFeedback(null)
    try {
      await onCancel()
      onClose()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível cancelar a assinatura.'
      })
    } finally {
      setCanceling(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={event => {
        event.preventDefault()
        close()
      }}
      className='w-[calc(100%-32px)] max-w-[480px] rounded-brand border border-[#c5c6cd] bg-white p-0 text-[#091426] shadow-[0_24px_80px_rgba(9,20,38,.28)] backdrop:bg-[#091426]/55'
      aria-labelledby='cancel-subscription-title'
    >
      <div className='p-6 sm:p-8'>
        <div className='flex items-start justify-between gap-6'>
          <div className='flex size-10 items-center justify-center rounded-brand bg-[#fff8e8] text-[#8a6218]'>
            <AlertTriangle className='size-5' strokeWidth={1.8} aria-hidden='true' />
          </div>
          <button
            type='button'
            onClick={close}
            disabled={canceling}
            className='flex size-9 items-center justify-center text-[#75777d] transition hover:bg-[#f0edef] hover:text-[#091426] disabled:opacity-50'
            aria-label='Fechar'
          >
            <X className='size-5' strokeWidth={1.8} aria-hidden='true' />
          </button>
        </div>
        <h2 id='cancel-subscription-title' className='mt-6 font-serif text-[28px] font-medium text-[#091426]'>
          Cancelar assinatura?
        </h2>
        <p className='mt-3 text-sm leading-6 text-[#5a5f62]'>
          A recorrência será encerrada no Asaas, cobranças futuras deixarão de ser geradas e sua conta voltará ao plano
          Free imediatamente.
        </p>
        <div className='mt-5'>
          <SettingsFeedback feedback={feedback} />
        </div>
        <div className='mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={close}
            disabled={canceling}
            className='h-10 border border-[#c5c6cd] px-5 text-sm font-medium text-[#45474c] transition hover:bg-[#f5f3f4] disabled:opacity-50'
          >
            Manter assinatura
          </button>
          <button
            type='button'
            onClick={confirmCancellation}
            disabled={canceling}
            className='inline-flex h-10 items-center justify-center gap-2 border border-[#8f1d2c] px-5 text-sm font-medium text-[#8f1d2c] transition hover:bg-[#fff1f1] disabled:opacity-50'
          >
            {canceling ? <LoaderCircle className='size-4 animate-spin' strokeWidth={1.8} aria-hidden='true' /> : null}
            {canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
