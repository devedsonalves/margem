'use client'

import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react'
import { SettingsFeedback, SettingsField } from '@/features/settings/components/SettingsFormControls'
import type { SettingsFeedbackState } from '@/features/settings/model/types'

const CONFIRMATION_TEXT = 'EXCLUIR'

export function DeleteAccountDialog({
  onClose,
  onDelete,
  open
}: {
  onClose: () => void
  onDelete: (password: string) => Promise<void>
  open: boolean
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const resetAndClose = () => {
    if (deleting) return
    setPassword('')
    setConfirmation('')
    setFeedback(null)
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (confirmation !== CONFIRMATION_TEXT) return

    setDeleting(true)
    setFeedback(null)
    try {
      await onDelete(password)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível excluir a conta.'
      })
      setDeleting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={event => {
        event.preventDefault()
        resetAndClose()
      }}
      className='w-[calc(100%-32px)] max-w-[520px] rounded-brand border border-[#c5c6cd] bg-white p-0 text-[#091426] shadow-[0_24px_80px_rgba(9,20,38,.28)] backdrop:bg-[#091426]/55'
      aria-labelledby='delete-account-title'
    >
      <form onSubmit={handleSubmit} className='p-6 sm:p-8'>
        <div className='flex items-start justify-between gap-6'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-brand bg-[#fff1f1] text-[#8f1d2c]'>
            <AlertTriangle className='size-5' strokeWidth={1.8} aria-hidden='true' />
          </div>
          <button
            type='button'
            onClick={resetAndClose}
            disabled={deleting}
            className='flex size-9 items-center justify-center text-[#75777d] transition hover:bg-[#f0edef] hover:text-[#091426] disabled:opacity-50'
            aria-label='Fechar'
          >
            <X className='size-5' strokeWidth={1.8} aria-hidden='true' />
          </button>
        </div>

        <h2 id='delete-account-title' className='mt-6 font-serif text-[28px] font-medium text-[#091426]'>
          Excluir sua conta?
        </h2>
        <p className='mt-3 text-sm leading-6 text-[#5a5f62]'>
          Esta ação remove permanentemente sua biblioteca, progresso, destaques, cadernos e dados da conta. Ela não pode
          ser desfeita.
        </p>

        <div className='mt-6 space-y-5'>
          <SettingsField
            id='delete-password'
            label='Confirme sua senha'
            type='password'
            value={password}
            autoComplete='current-password'
            onChange={setPassword}
          />
          <SettingsField
            id='delete-confirmation'
            label={`Digite ${CONFIRMATION_TEXT} para continuar`}
            value={confirmation}
            autoComplete='off'
            onChange={setConfirmation}
          />
          <SettingsFeedback feedback={feedback} />
        </div>

        <div className='mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={resetAndClose}
            disabled={deleting}
            className='h-10 border border-[#c5c6cd] px-5 text-sm font-medium text-[#45474c] transition hover:bg-[#f5f3f4] disabled:opacity-50'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={deleting || !password || confirmation !== CONFIRMATION_TEXT}
            className='inline-flex h-10 items-center justify-center gap-2 bg-[#8f1d2c] px-5 text-sm font-medium text-white transition hover:bg-[#741724] disabled:cursor-not-allowed disabled:opacity-50'
          >
            {deleting ? (
              <LoaderCircle className='size-4 animate-spin' strokeWidth={1.8} aria-hidden='true' />
            ) : (
              <Trash2 className='size-4' strokeWidth={1.8} aria-hidden='true' />
            )}
            {deleting ? 'Excluindo...' : 'Excluir permanentemente'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
