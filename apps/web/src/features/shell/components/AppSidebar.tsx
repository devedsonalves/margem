'use client'

import Link from 'next/link'
import type { ElementType } from 'react'
import { Compass, CreditCard, Home, LibraryBig, LogOut, Menu, Plus, Settings, X } from 'lucide-react'
import { BrandLogo } from '@/shared/ui/BrandLogo'

export type ActiveNavigationItem = 'inicio' | 'acervo' | 'explorar' | 'planos' | 'configuracoes'

type AppSidebarProps = {
  activeItem: ActiveNavigationItem
  uploading?: boolean
  onLogout: () => void
  onUploadClick: () => void
}

const navItems = [
  { id: 'inicio', href: '/inicio', label: 'Início', icon: Home, disabled: false },
  { id: 'acervo', href: '/acervo', label: 'Meu acervo', icon: LibraryBig, disabled: false },
  { id: 'planos', href: '/planos', label: 'Planos', icon: CreditCard, disabled: false },
  { id: 'configuracoes', href: '/configuracoes', label: 'Configurações', icon: Settings, disabled: false },
  { id: 'explorar', href: '/explorar', label: 'Explorar', icon: Compass, disabled: true }
] as const

export function AppSidebar({ activeItem, onLogout, onUploadClick, uploading = false }: AppSidebarProps) {
  return (
    <>
      <MobileNavigation
        activeItem={activeItem}
        uploading={uploading}
        onLogout={onLogout}
        onUploadClick={onUploadClick}
      />

      <aside className='fixed inset-y-0 left-0 z-20 hidden w-64 shrink-0 flex-col justify-between border-r border-[#c5c6cd] bg-white px-6 py-6 lg:flex'>
        <div>
          <div className='pb-12'>
            <Link href='/inicio' className='block scale-110' aria-label='Ir para início'>
              <BrandLogo />
            </Link>
          </div>

          <nav className='flex flex-col gap-2'>
            {navItems.map(item => (
              <SidebarLink
                key={item.id}
                active={activeItem === item.id}
                href={item.href}
                icon={item.icon}
                label={item.label}
                disabled={item.disabled}
              />
            ))}
          </nav>
        </div>

        <SidebarActions uploading={uploading} onLogout={onLogout} onUploadClick={onUploadClick} />
      </aside>
    </>
  )
}

function MobileNavigation({ activeItem, onLogout, onUploadClick, uploading }: AppSidebarProps) {
  return (
    <header className='fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-[#c5c6cd] bg-white px-5 sm:px-8 lg:hidden'>
      <Link href='/inicio' className='block w-[124px]' aria-label='Ir para início'>
        <BrandLogo />
      </Link>

      <details className='group relative ml-auto'>
        <summary className='flex size-10 cursor-pointer list-none items-center justify-center rounded-brand border border-[#c5c6cd] text-[#091426] transition hover:bg-[#f5f3f4] [&::-webkit-details-marker]:hidden'>
          <Menu className='size-5 group-open:hidden' strokeWidth={1.8} aria-hidden='true' />
          <X className='hidden size-5 group-open:block' strokeWidth={1.8} aria-hidden='true' />
          <span className='sr-only'>Abrir navegação</span>
        </summary>

        <div className='absolute right-0 top-12 w-[280px] overflow-hidden rounded-brand border border-[#c5c6cd] bg-white p-3 shadow-[0_18px_50px_rgba(9,20,38,.16)]'>
          <nav className='flex flex-col gap-1' aria-label='Navegação principal'>
            {navItems.map(item => {
              const Icon = item.icon

              return item.disabled ? (
                <span key={item.id} className='flex items-center gap-3 px-3 py-2.5 text-sm text-[#9a9ca1]'>
                  <Icon className='size-4' strokeWidth={1.8} aria-hidden='true' />
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition',
                    activeItem === item.id
                      ? 'bg-[#091426] text-white'
                      : 'text-[#5a5f62] hover:bg-[#ebe8ea] hover:text-[#091426]'
                  ].join(' ')}
                >
                  <Icon className='size-4' strokeWidth={1.8} aria-hidden='true' />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className='mt-3 border-t border-[#e4e2e3] pt-3'>
            <SidebarActions compact uploading={uploading} onLogout={onLogout} onUploadClick={onUploadClick} />
          </div>
        </div>
      </details>
    </header>
  )
}

function SidebarActions({
  compact = false,
  onLogout,
  onUploadClick,
  uploading
}: Omit<AppSidebarProps, 'activeItem'> & { compact?: boolean }) {
  return (
    <div className={compact ? '' : 'border-t border-[#c5c6cd] pt-[25px]'}>
      <button
        type='button'
        disabled={uploading}
        onClick={onUploadClick}
        className='flex h-10 w-full items-center justify-center gap-3 bg-[#091426] px-4 text-sm font-medium tracking-[0.01em] text-white transition hover:bg-[#17243a] disabled:cursor-not-allowed disabled:opacity-60'
      >
        <Plus className='size-[14px]' strokeWidth={2.2} aria-hidden='true' />
        {uploading ? 'Enviando...' : 'Novo Documento'}
      </button>
      <button
        type='button'
        onClick={onLogout}
        className='mt-2 flex h-10 w-full items-center justify-center gap-3 border border-[#091426] px-4 text-sm font-medium tracking-[0.01em] text-[#091426] transition hover:border-[#8f1d2c] hover:bg-[#fff1f1] hover:text-[#8f1d2c]'
      >
        <LogOut className='size-[14px]' strokeWidth={2.2} aria-hidden='true' />
        Sair
      </button>
    </div>
  )
}

function SidebarLink({
  active = false,
  disabled = false,
  href,
  icon: Icon,
  label
}: {
  active?: boolean
  disabled?: boolean
  href: string
  icon: ElementType
  label: string
}) {
  if (disabled) {
    return (
      <button
        type='button'
        disabled
        aria-label={`${label} indisponível`}
        className='flex w-full cursor-not-allowed items-center gap-4 p-2 text-left text-base leading-6 text-[#8d9096] opacity-60'
      >
        <Icon className='size-5 shrink-0' strokeWidth={1.8} />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={[
        'flex w-full items-center gap-4 p-2 text-base leading-6 transition',
        active ? 'bg-[#091426] text-white' : 'text-[#5a5f62] hover:bg-[#ebe8ea] hover:text-[#091426]'
      ].join(' ')}
    >
      <Icon className='size-5 shrink-0' strokeWidth={1.8} />
      <span>{label}</span>
    </Link>
  )
}
