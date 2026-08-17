'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { KeyRound, LoaderCircle, LogOut } from 'lucide-react'
import { SectionHeader } from '@/features/settings/components/ProfileSettingsSection'
import { SettingsFeedback, SettingsField } from '@/features/settings/components/SettingsFormControls'
import type { PasswordSettingsInput, SettingsFeedbackState } from '@/features/settings/model/types'

export function SecuritySettingsSection({
  onChangePassword,
  onLogout
}: {
  onChangePassword: (input: PasswordSettingsInput) => Promise<{ message: string }>
  onLogout: () => void
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFeedback(null)

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 8 caracteres.' })
      return
    }

    if (newPassword !== confirmation) {
      setFeedback({ type: 'error', message: 'A confirmação não corresponde à nova senha.' })
      return
    }

    setSaving(true)
    try {
      const response = await onChangePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
      setFeedback({ type: 'success', message: response.message })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível atualizar a senha.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id='seguranca' className='scroll-mt-24'>
      <SectionHeader title='Segurança' description='Atualize sua senha ou encerre a sessão deste dispositivo.' />

      <form onSubmit={handleSubmit} className='mt-7 space-y-5'>
        <SettingsField
          id='current-password'
          label='Senha atual'
          type='password'
          value={currentPassword}
          autoComplete='current-password'
          onChange={setCurrentPassword}
        />
        <div className='grid gap-5 sm:grid-cols-2'>
          <SettingsField
            id='new-password'
            label='Nova senha'
            type='password'
            value={newPassword}
            autoComplete='new-password'
            placeholder='Mínimo de 8 caracteres'
            onChange={setNewPassword}
          />
          <SettingsField
            id='confirm-password'
            label='Confirmar nova senha'
            type='password'
            value={confirmation}
            autoComplete='new-password'
            onChange={setConfirmation}
          />
        </div>
        <SettingsFeedback feedback={feedback} />
        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={saving}
            className='inline-flex h-10 items-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white transition hover:bg-[#17243a] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {saving ? (
              <LoaderCircle className='size-4 animate-spin' strokeWidth={1.8} aria-hidden='true' />
            ) : (
              <KeyRound className='size-4' strokeWidth={1.8} aria-hidden='true' />
            )}
            {saving ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </div>
      </form>

      <div className='mt-9 flex flex-col gap-4 border-t border-[#e4e2e3] pt-6 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-sm font-semibold text-[#091426]'>Sessão atual</h3>
          <p className='mt-1 text-sm leading-5 text-[#5a5f62]'>Encerra o acesso somente neste navegador.</p>
        </div>
        <button
          type='button'
          onClick={onLogout}
          className='inline-flex h-10 w-fit items-center gap-2 border border-[#091426] px-4 text-sm font-medium text-[#091426] transition hover:border-[#8f1d2c] hover:bg-[#fff1f1] hover:text-[#8f1d2c]'
        >
          <LogOut className='size-4' strokeWidth={1.8} aria-hidden='true' />
          Sair deste dispositivo
        </button>
      </div>
    </section>
  )
}
