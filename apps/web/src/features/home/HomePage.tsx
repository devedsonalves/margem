'use client'

import { AppShell } from '@/features/shell/components/AppShell'
import {
  CurrentlyReadingCard,
  RecentReflectionsSection,
  WeeklyFocusCard
} from '@/features/home/components/HomeSections'
import { useHomeDashboard } from '@/features/home/useHomeDashboard'

export default function HomePage() {
  const { dashboard, firstName, loading, logout, uploadDocument, uploading } = useHomeDashboard()

  return (
    <AppShell activeItem='inicio' uploading={uploading} onLogout={logout} onUpload={uploadDocument}>
      {openUpload => (
        <>
          <section className='mb-[38px]'>
            <h1 className='font-serif text-[32px] font-medium leading-[41.6px] text-[#091426]'>Bom dia, {firstName}</h1>
            <p className='mt-1 text-base italic leading-6 text-[#5a5f62]'>{dashboard.greeting}</p>
          </section>

          <section className='mb-24 grid gap-12 lg:grid-cols-3' id='documentos'>
            <CurrentlyReadingCard {...dashboard.currentReading} loading={loading} onUpload={openUpload} />
            <WeeklyFocusCard stats={dashboard.focusStats} />
          </section>

          <RecentReflectionsSection loading={loading} onUpload={openUpload} reflections={dashboard.reflections} />
        </>
      )}
    </AppShell>
  )
}
