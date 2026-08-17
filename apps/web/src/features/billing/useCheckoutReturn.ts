'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BillingOverviewDTO } from '@margem/types'
import { billingApi } from '@/features/billing/api/billingApi'

const STATUS_REFRESH_INTERVAL_MS = 5_000

export function useCheckoutReturn() {
  const [billing, setBilling] = useState<BillingOverviewDTO | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setBilling(await billingApi.getOverview())
    } catch (error) {
      console.error('Failed to refresh billing', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (billing && billing.planStatus !== 'PENDING') return

    const interval = window.setInterval(refresh, STATUS_REFRESH_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [billing, refresh])

  return { billing, loading }
}
