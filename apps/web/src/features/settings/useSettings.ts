'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useDocumentUpload } from '@/features/library/useDocumentUpload'
import { settingsApi } from '@/features/settings/api/settingsApi'
import type { PasswordSettingsInput, ProfileSettingsInput } from '@/features/settings/model/types'

export function useSettings() {
  const { isLoading: authLoading, logout, replaceSession, token, user: sessionUser } = useAuth()
  const [user, setUser] = useState(sessionUser)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    setUser(sessionUser)
  }, [sessionUser])

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setLoadingProfile(false)
      return
    }

    let active = true

    settingsApi
      .getProfile()
      .then(profile => {
        if (active) setUser(profile)
      })
      .catch(error => console.error('Failed to refresh settings profile', error))
      .finally(() => {
        if (active) setLoadingProfile(false)
      })

    return () => {
      active = false
    }
  }, [authLoading, token])

  const saveProfile = useCallback(
    async (input: ProfileSettingsInput) => {
      const session = await settingsApi.updateProfile(input)
      replaceSession(session)
      setUser(session.user)
      return session.user
    },
    [replaceSession]
  )

  const changePassword = useCallback((input: PasswordSettingsInput) => settingsApi.updatePassword(input), [])

  const cancelSubscription = useCallback(async () => {
    const response = await settingsApi.cancelSubscription()
    const profile = await settingsApi.getProfile()
    setUser(profile)
    if (token) replaceSession({ token, user: profile })
    return response
  }, [replaceSession, token])

  const exportData = useCallback(async () => {
    const data = await settingsApi.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `margem-dados-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [])

  const deleteAccount = useCallback(
    async (password: string) => {
      await settingsApi.deleteAccount(password)
      logout()
    },
    [logout]
  )

  const { uploadDocument, uploading } = useDocumentUpload()

  return {
    cancelSubscription,
    changePassword,
    deleteAccount,
    exportData,
    loadingProfile,
    logout,
    saveProfile,
    uploadDocument,
    uploading,
    user
  }
}
