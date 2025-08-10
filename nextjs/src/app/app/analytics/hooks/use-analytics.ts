'use client'

import { useState, useCallback, useEffect } from 'react'
import { InventoryAnalytics, ApiResponse } from '@/lib/types'

interface UseAnalyticsProps {
  days?: number
  autoRefresh?: boolean
}

export function useAnalytics(props: UseAnalyticsProps = {}) {
  const { days = 30, autoRefresh = true } = props
  
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (customDays?: number) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.set('days', (customDays || days).toString())

      const response = await fetch(`/api/analytics?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<InventoryAnalytics> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.data) {
        setAnalytics(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [days])

  const refreshAnalytics = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-fetch analytics on mount
  useEffect(() => {
    if (autoRefresh) {
      fetchAnalytics()
    }
  }, [fetchAnalytics, autoRefresh])

  // Auto-refresh every 5 minutes if autoRefresh is enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [fetchAnalytics, autoRefresh])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    refreshAnalytics,
  }
}