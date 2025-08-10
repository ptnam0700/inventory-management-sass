'use client'

import { useState, useCallback } from 'react'
import { StockAdjustmentWithRelations, AdjustmentsResponse, ApiResponse } from '@/lib/types'

interface UseAdjustmentsProps {
  store_id?: string
  adjustment_type?: string
  reason?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}


export function useAdjustments() {
  const [adjustments, setAdjustments] = useState<StockAdjustmentWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAdjustments = useCallback(async (params: UseAdjustmentsProps = {}) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      if (params.store_id) searchParams.set('store_id', params.store_id)
      if (params.adjustment_type) searchParams.set('adjustment_type', params.adjustment_type)
      if (params.reason) searchParams.set('reason', params.reason)
      if (params.start_date) searchParams.set('start_date', params.start_date)
      if (params.end_date) searchParams.set('end_date', params.end_date)
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/stock-adjustments?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<AdjustmentsResponse> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.data) {
        setAdjustments(result.data.adjustments)
        setTotalCount(result.data.totalCount)
        setTotalPages(result.data.totalPages)
        setCurrentPage(result.data.currentPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    adjustments,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    fetchAdjustments,
  }
}