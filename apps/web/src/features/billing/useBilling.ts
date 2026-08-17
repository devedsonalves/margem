'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BillingOverviewDTO, PlanCode } from '@margem/types'
import { useAuth } from '@/features/auth/AuthProvider'
import { billingApi } from '@/features/billing/api/billingApi'
import { useDocumentUpload } from '@/features/library/useDocumentUpload'

const BILLING_POLL_INTERVAL_MS = 5_000

export function useBilling() {
  const { isLoading: authLoading, logout, token } = useAuth()
  const [billing, setBilling] = useState<BillingOverviewDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutPlan, setCheckoutPlan] = useState<PlanCode | null>(null)

  const refresh = useCallback(async () => {
    if (!token) return

    try {
      setBilling(await billingApi.getOverview())
    } catch (error) {
      console.error('Failed to load billing', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setLoading(false)
      return
    }

    refresh()
  }, [authLoading, refresh, token])

  useEffect(() => {
    if (!token || billing?.planStatus !== 'PENDING') return
    const interval = window.setInterval(refresh, BILLING_POLL_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [billing?.planStatus, refresh, token])

  const startCheckout = useCallback(async (plan: PlanCode) => {
    setCheckoutPlan(plan)
    try {
      const checkout = await billingApi.createCheckout(plan)
      window.location.assign(checkout.checkoutUrl)
    } finally {
      setCheckoutPlan(null)
    }
  }, [])

  const { uploadDocument, uploading } = useDocumentUpload()

  return {
    billing,
    checkoutPlan,
    loading,
    logout,
    startCheckout,
    uploadDocument,
    uploading
  }
}
