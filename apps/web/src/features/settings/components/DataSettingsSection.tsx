'use client'

import { useState } from 'react'
import { Download, LoaderCircle, Trash2 } from 'lucide-react'
import { DeleteAccountDialog } from '@/features/settings/components/DeleteAccountDialog'
import { SectionHeader } from '@/features/settings/components/ProfileSettingsSection'
import { SettingsFeedback } from '@/features/settings/components/SettingsFormControls'
import type { SettingsFeedbackState } from '@/features/settings/model/types'

export function DataSettingsSection({
  onDeleteAccount,
  onExport
}: {
  onDeleteAccount: (password: string) => Promise<void>
  onExport: () => Promise<void>
}) {
  const [exporting, setExporting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null)

  const handleExport = async () => {
    setExporting(true)
    setFeedback(null)
    try {
      await onExport()
      setFeedback({ type: 'success', message: 'Arquivo de dados gerado com sucesso.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível exportar seus dados.'
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <section id='dados' className='scroll-mt-24'>
      <SectionHeader title='Dados da conta' description='Baixe uma cópia das suas informações ou encerre sua conta.' />

      <div className='mt-7 flex flex-col gap-5 border-y border-[#e4e2e3] py-6 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-sm font-semibold text-[#091426]'>Exportar dados</h3>
          <p className='mt-1 max-w-lg text-sm leading-5 text-[#5a5f62]'>
            Baixe perfil, documentos, progresso, destaques e cadernos em formato JSON.
          </p>
        </div>
        <button
          type='button'
          onClick={handleExport}
          disabled={exporting}
          className='inline-flex h-10 w-fit shrink-0 items-center gap-2 border border-[#091426] px-4 text-sm font-medium text-[#091426] transition hover:bg-[#ebe8ea] disabled:cursor-not-allowed disabled:opacity-60'
        >
          {exporting ? (
            <LoaderCircle className='size-4 animate-spin' strokeWidth={1.8} aria-hidden='true' />
          ) : (
            <Download className='size-4' strokeWidth={1.8} aria-hidden='true' />
          )}
          {exporting ? 'Preparando...' : 'Baixar meus dados'}
        </button>
      </div>

      <div className='mt-5'>
        <SettingsFeedback feedback={feedback} />
      </div>

      <div className='mt-10 border-t border-[#e2a6a6] pt-7'>
        <p className='text-xs font-semibold uppercase tracking-[0.1em] text-[#8f1d2c]'>Zona de risco</p>
        <div className='mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-[#091426]'>Excluir conta</h3>
            <p className='mt-1 max-w-lg text-sm leading-5 text-[#5a5f62]'>
              Remove permanentemente sua conta e todo o conteúdo associado.
            </p>
          </div>
          <button
            type='button'
            onClick={() => setDeleteDialogOpen(true)}
            className='inline-flex h-10 w-fit shrink-0 items-center gap-2 border border-[#8f1d2c] px-4 text-sm font-medium text-[#8f1d2c] transition hover:bg-[#fff1f1]'
          >
            <Trash2 className='size-4' strokeWidth={1.8} aria-hidden='true' />
            Excluir minha conta
          </button>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={onDeleteAccount}
      />
    </section>
  )
}
