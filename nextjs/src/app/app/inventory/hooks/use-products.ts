'use client'

import { useState, useCallback } from 'react'
import { Product, ProductsResponse, ApiResponse } from '@/lib/types'

interface UseProductsProps {
  search?: string
  store_id?: string
  category_id?: string
  low_stock?: boolean
  page?: number
  limit?: number
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = useCallback(async (params: UseProductsProps = {}) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      if (params.search) searchParams.set('search', params.search)
      if (params.store_id) searchParams.set('store_id', params.store_id)
      if (params.category_id) searchParams.set('category_id', params.category_id)
      if (params.low_stock) searchParams.set('low_stock', 'true')
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/products?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<ProductsResponse> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.data) {
        setProducts(result.data.products)
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

  const createProduct = useCallback(async (productData: Partial<Product>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<Product> = await response.json()
      
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

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<Product> = await response.json()
      
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

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, {
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

  return {
    products,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}