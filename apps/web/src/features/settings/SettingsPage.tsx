'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Database, Settings2, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react'
import { AppShell } from '@/features/shell/components/AppShell'
import { DataSettingsSection } from '@/features/settings/components/DataSettingsSection'
import { PlanSettingsSection } from '@/features/settings/components/PlanSettingsSection'
import { ProfileSettingsSection } from '@/features/settings/components/ProfileSettingsSection'
import { SecuritySettingsSection } from '@/features/settings/components/SecuritySettingsSection'
import { useSettings } from '@/features/settings/useSettings'

type SettingsSectionId = 'perfil' | 'assinatura' | 'seguranca' | 'dados'

const settingsNavigation: Array<{ id: SettingsSectionId; label: string; icon: LucideIcon }> = [
  { id: 'perfil', label: 'Perfil', icon: UserRound },
  { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
  { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
  { id: 'dados', label: 'Dados da conta', icon: Database }
]

export default function SettingsPage() {
  const settings = useSettings()
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(() => getSectionFromHash())

  useEffect(() => {
    const handleHashChange = () => setActiveSection(getSectionFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const selectSection = (section: SettingsSectionId) => {
    setActiveSection(section)
    window.history.replaceState(null, '', `#${section}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AppShell
      activeItem='configuracoes'
      uploading={settings.uploading}
      onLogout={settings.logout}
      onUpload={settings.uploadDocument}
    >
      <div className='w-full max-w-[1180px]'>
        <header className='border-b border-[#c5c6cd] pb-6'>
          <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#75777d]'>
            <Settings2 className='size-4 text-[#091426]' strokeWidth={1.8} aria-hidden='true' />
            Conta
          </p>
          <h1 className='mt-2 font-serif text-[34px] font-medium leading-[42px] text-[#091426]'>Configurações</h1>
          <p className='mt-2 max-w-2xl text-base leading-6 text-[#5a5f62]'>
            Escolha uma área para gerenciar sua conta sem sair do contexto.
          </p>
        </header>

        <div className='mt-8 grid gap-10 lg:grid-cols-[210px_minmax(0,760px)] lg:gap-12 xl:gap-16'>
          <nav
            className='grid grid-cols-2 gap-2 border-b border-[#c5c6cd] pb-4 sm:flex sm:flex-wrap lg:sticky lg:top-8 lg:h-fit lg:flex-col lg:flex-nowrap lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6'
            aria-label='Seções das configurações'
          >
            {settingsNavigation.map(item => (
              <SettingsNavigationButton
                key={item.id}
                active={activeSection === item.id}
                onClick={() => selectSection(item.id)}
                {...item}
              />
            ))}
          </nav>

          <div className='min-w-0'>
            {activeSection === 'perfil' ? (
              <ProfileSettingsSection
                loading={settings.loadingProfile}
                user={settings.user}
                onSave={settings.saveProfile}
              />
            ) : null}
            {activeSection === 'assinatura' ? (
              <PlanSettingsSection
                loading={settings.loadingProfile}
                user={settings.user}
                onCancel={settings.cancelSubscription}
              />
            ) : null}
            {activeSection === 'seguranca' ? (
              <SecuritySettingsSection onChangePassword={settings.changePassword} onLogout={settings.logout} />
            ) : null}
            {activeSection === 'dados' ? (
              <DataSettingsSection onExport={settings.exportData} onDeleteAccount={settings.deleteAccount} />
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function SettingsNavigationButton({
  active,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex h-10 items-center gap-3 px-3 text-left text-sm font-medium transition',
        active ? 'bg-[#091426] text-white' : 'text-[#5a5f62] hover:bg-[#ebe8ea] hover:text-[#091426]'
      ].join(' ')}
    >
      <Icon className='size-4' strokeWidth={1.8} aria-hidden='true' />
      {label}
    </button>
  )
}

function getSectionFromHash(): SettingsSectionId {
  if (typeof window === 'undefined') return 'perfil'
  const hash = window.location.hash.slice(1) as SettingsSectionId
  return settingsNavigation.some(item => item.id === hash) ? hash : 'perfil'
}
