'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ReaderProvider, useReader } from '@/features/reader/ReaderProvider'
import { ReaderLayout } from '@/features/reader/components/ReaderLayout'
import { Notebook } from '@/features/reader/components/Notebook'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/features/reader/components/PDFViewer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className='h-full w-full flex items-center justify-center bg-slate-50'>
      <div className='flex flex-col items-center gap-4'>
        <div className='w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin' />
        <p className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
          Carregando Visualizador...
        </p>
      </div>
    </div>
  )
})

function ReaderPageContent() {
  const { id } = useParams()
  const { loadDocument, isLoading } = useReader()

  useEffect(() => {
    if (id) {
      loadDocument(id as string)
    }
  }, [id, loadDocument])

  if (isLoading) {
    return (
      <div className='flex h-[100dvh] w-screen flex-col items-center justify-center gap-4 bg-bg-main lg:h-screen'>
        <div className='w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin' />
        <span className='text-text-secondary font-medium animate-pulse'>Preparando ambiente de leitura...</span>
      </div>
    )
  }

  return <ReaderLayout viewer={<PDFViewer />} notebook={<Notebook />} />
}

export default function ReaderPage() {
  return (
    <ReaderProvider>
      <ReaderPageContent />
    </ReaderProvider>
  )
}
