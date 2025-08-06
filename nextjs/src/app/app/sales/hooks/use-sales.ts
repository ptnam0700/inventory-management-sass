'use client'

import { useState, useCallback } from 'react'
import { Sale, SalesResponse, ApiResponse } from '@/lib/types'

interface SalesFilters {
  search?: string
  store_id?: string
  payment_status?: string
  payment_method?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchSales = useCallback(async (filters: SalesFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.store_id) params.append('store_id', filters.store_id)
      if (filters.payment_status) params.append('payment_status', filters.payment_status)
      if (filters.payment_method) params.append('payment_method', filters.payment_method)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/sales?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<SalesResponse> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.data) {
        setSales(result.data.sales)
        setTotalCount(result.data.totalCount)
        setTotalPages(result.data.totalPages)
        setCurrentPage(result.data.currentPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
      setSales([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createSale = useCallback(async (saleData: {
    store_id: string
    customer_name?: string
    customer_phone?: string
    customer_email?: string
    sale_date?: string
    payment_method?: string
    payment_status?: string
    discount_amount?: number
    tax_amount?: number
    notes?: string
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      discount_amount?: number
    }>
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<Sale> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSale = useCallback(async (saleId: string, updates: {
    customer_name?: string
    customer_phone?: string
    customer_email?: string
    payment_method?: string
    payment_status?: string
    notes?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<Sale> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteSale = useCallback(async (saleId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sales/${saleId}`, {
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
      setError(err instanceof Error ? err.message : 'Failed to delete sale')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getSale = useCallback(async (saleId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sales/${saleId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Sale> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sale')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    sales,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
    getSale
  }
}