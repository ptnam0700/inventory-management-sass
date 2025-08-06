'use client'

import { useState, useCallback } from 'react'
import { Return, ReturnsResponse, ApiResponse } from '@/lib/types'

interface ReturnsFilters {
  search?: string
  store_id?: string
  return_type?: string
  status?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export function useReturns() {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchReturns = useCallback(async (filters: ReturnsFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.store_id) params.append('store_id', filters.store_id)
      if (filters.return_type) params.append('return_type', filters.return_type)
      if (filters.status) params.append('status', filters.status)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/returns?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ReturnsResponse> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.data) {
        setReturns(result.data.returns)
        setTotalCount(result.data.totalCount)
        setTotalPages(result.data.totalPages)
        setCurrentPage(result.data.currentPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch returns')
      setReturns([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createReturn = useCallback(async (returnData: {
    sale_id?: string
    store_id: string
    return_date?: string
    return_type?: string
    refund_method?: string
    reason?: string
    status?: string
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      condition: string
    }>
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<Return> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create return')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateReturn = useCallback(async (returnId: string, updates: {
    status?: string
    refund_method?: string
    refund_amount?: number
    reason?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<Return> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update return')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteReturn = useCallback(async (returnId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete return')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReturn = useCallback(async (returnId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/returns/${returnId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Return> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch return')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const approveReturn = useCallback(async (returnId: string) => {
    return updateReturn(returnId, { status: 'APPROVED' })
  }, [updateReturn])

  const rejectReturn = useCallback(async (returnId: string, reason?: string) => {
    return updateReturn(returnId, { status: 'REJECTED', reason })
  }, [updateReturn])

  return {
    returns,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    fetchReturns,
    createReturn,
    updateReturn,
    deleteReturn,
    getReturn,
    approveReturn,
    rejectReturn
  }
}