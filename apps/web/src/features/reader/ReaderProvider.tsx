'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useReaderController, type ReaderController } from '@/features/reader/useReaderController'

const ReaderContext = createContext<ReaderController | undefined>(undefined)

export function ReaderProvider({ children }: { children: ReactNode }) {
  const reader = useReaderController()

  return <ReaderContext.Provider value={reader}>{children}</ReaderContext.Provider>
}

export function useReader() {
  const context = useContext(ReaderContext)
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider')
  }
  return context
}
