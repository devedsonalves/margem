'use client'

import { useCallback, useState } from 'react'
import { documentApi } from '@/features/library/api/documentApi'

type DocumentUploadedHandler = () => void | Promise<void>

export function useDocumentUpload(onUploaded?: DocumentUploadedHandler) {
  const [uploading, setUploading] = useState(false)

  const uploadDocument = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        await documentApi.upload(file, file.name.replace(/\.pdf$/i, ''), 1)
        await onUploaded?.()
      } finally {
        setUploading(false)
      }
    },
    [onUploaded]
  )

  return { uploadDocument, uploading }
}
