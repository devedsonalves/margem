'use client'

import { useRef, type ChangeEvent, type ReactNode } from 'react'
import { AppSidebar, type ActiveNavigationItem } from '@/features/shell/components/AppSidebar'

type AppShellProps = {
  activeItem: ActiveNavigationItem
  children: ReactNode | ((openUpload: () => void) => ReactNode)
  uploading: boolean
  onLogout: () => void
  onUpload: (file: File) => Promise<void>
}

export function AppShell({ activeItem, children, onLogout, onUpload, uploading }: AppShellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const openUpload = () => fileInputRef.current?.click()

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await onUpload(file)
    } catch (error) {
      console.error('Failed to upload document', error)
      alert('Falha no upload')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className='flex min-h-screen items-start bg-[#fbf8fa] text-[#091426]'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.pdf,application/pdf'
        className='hidden'
        onChange={handleFileUpload}
      />
      <AppSidebar activeItem={activeItem} uploading={uploading} onLogout={onLogout} onUploadClick={openUpload} />
      <main className='min-w-0 flex-1 px-5 pb-16 pt-24 sm:px-8 lg:ml-64 lg:px-12 lg:pb-24 lg:pt-12'>
        {typeof children === 'function' ? children(openUpload) : children}
      </main>
    </div>
  )
}
