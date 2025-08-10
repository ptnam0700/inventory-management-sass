'use client'

import { useState, useCallback, useEffect } from 'react'
import { StoreWithRelations, StoresResponse, ApiResponse } from '@/lib/types'

interface UseStoresProps {
  search?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export function useStores() {
  const [stores, setStores] = useState<StoreWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchStores = useCallback(async (params: UseStoresProps = {}) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      if (params.search) searchParams.set('search', params.search)
      if (params.is_active !== undefined) searchParams.set('is_active', params.is_active.toString())
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/stores?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<StoresResponse> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.data) {
        setStores(result.data.stores)
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

  const createStore = useCallback(async (storeData: Partial<StoreWithRelations>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<StoreWithRelations> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStore = useCallback(async (id: string, storeData: Partial<StoreWithRelations>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<StoreWithRelations> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteStore = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch stores on mount
  useEffect(() => {
    fetchStores({ is_active: true })
  }, [fetchStores])

  return {
    stores,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
  }
}