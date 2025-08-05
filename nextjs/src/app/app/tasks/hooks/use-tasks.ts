'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task, TasksResponse, ApiResponse } from '@/lib/types'
import { TaskQueryInput } from '@/lib/validations/task'

export function useTasks(initialQuery: Partial<TaskQueryInput> = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  const [query, setQuery] = useState<Partial<TaskQueryInput>>({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    priority: 'all',
    sort: 'created_at',
    order: 'desc',
    ...initialQuery,
  })

  const fetchTasks = useCallback(async (queryParams: Partial<TaskQueryInput>) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/tasks?${searchParams.toString()}`)
      const result: ApiResponse<TasksResponse> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tasks')
      }

      if (result.data) {
        setTasks(result.data.tasks)
        setMeta({
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalCount: result.data.totalCount,
          hasNextPage: result.data.currentPage < result.data.totalPages,
          hasPreviousPage: result.data.currentPage > 1,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks'
      setError(errorMessage)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateQuery = useCallback((newQuery: Partial<TaskQueryInput>) => {
    setQuery(prev => ({ ...prev, ...newQuery, page: 1 }))
  }, [])

  const goToPage = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }, [])

  const refresh = useCallback(() => {
    fetchTasks(query)
  }, [fetchTasks, query])

  useEffect(() => {
    fetchTasks(query)
  }, [fetchTasks, query])

  return {
    tasks,
    loading,
    error,
    meta,
    query,
    updateQuery,
    goToPage,
    refresh,
  }
}