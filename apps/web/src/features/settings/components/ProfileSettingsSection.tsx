'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { LoaderCircle, Save } from 'lucide-react'
import type { AuthUser } from '@/features/auth/model/types'
import { SettingsFeedback, SettingsField } from '@/features/settings/components/SettingsFormControls'
import type { ProfileSettingsInput, SettingsFeedbackState } from '@/features/settings/model/types'

export function ProfileSettingsSection({
  loading,
  onSave,
  user
}: {
  loading: boolean
  onSave: (input: ProfileSettingsInput) => Promise<AuthUser | null>
  user: AuthUser | null
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null)

  useEffect(() => {
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
  }, [user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      await onSave({ name: name.trim(), email: email.trim() })
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível atualizar o perfil.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id='perfil' className='scroll-mt-24 pb-12'>
      <SectionHeader title='Perfil' description='Informações usadas para identificar sua conta no Margem.' />

      {loading ? (
        <div className='mt-7 space-y-5'>
          <div className='h-16 animate-pulse rounded-brand bg-[#e4e2e3]' />
          <div className='h-11 animate-pulse rounded-brand bg-[#e4e2e3]' />
          <div className='h-11 animate-pulse rounded-brand bg-[#e4e2e3]' />
        </div>
      ) : (
        <>
          <div className='mt-7 flex items-center gap-4 border-y border-[#e4e2e3] py-5'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-brand bg-[#091426] font-serif text-xl font-semibold text-white'>
              {getInitials(name || email)}
            </div>
            <div className='min-w-0'>
              <p className='truncate font-serif text-lg font-medium text-[#091426]'>{name || 'Leitor Margem'}</p>
              <p className='truncate text-sm text-[#5a5f62]'>{email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='mt-7 space-y-5'>
            <div className='grid gap-5 sm:grid-cols-2'>
              <SettingsField
                id='settings-name'
                label='Nome completo'
                value={name}
                autoComplete='name'
                onChange={setName}
              />
              <SettingsField
                id='settings-email'
                label='E-mail'
                type='email'
                value={email}
                autoComplete='email'
                onChange={setEmail}
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
                  <Save className='size-4' strokeWidth={1.8} aria-hidden='true' />
                )}
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

export function SectionHeader({ description, title }: { description: string; title: string }) {
  return (
    <header>
      <h2 className='font-serif text-2xl font-medium text-[#091426]'>{title}</h2>
      <p className='mt-1 max-w-2xl text-sm leading-6 text-[#5a5f62]'>{description}</p>
    </header>
  )
}

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'M'
  )
}
