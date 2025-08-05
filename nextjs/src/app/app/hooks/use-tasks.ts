"use client"

import { useState, useEffect, useCallback } from "react"
import {
    createSPASassClientAuthenticated as createSPASassClient
} from '@/lib/supabase/client';
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
interface UseTasksParams {
  page?: number
  limit?: number
  search?: string
  status?: TaskStatus | "all"
  priority?: TaskPriority | "all"
  assignees?: string[]
}

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  totalCount: number
  totalPages: number
  currentPage: number
  refetch: () => Promise<void>
}

export function useTasks({
    page = 1,
    limit = 6,
    search = "",
    status = "all",
    priority = "all",
    assignees = []
  }: UseTasksParams = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchTasks = useCallback(async () => {
    try {
        setLoading(true)
        setError(null)
    
        const supabase = await createSPASassClient();
        const data = await supabase.getTasks({
            page,
            limit,
            search,
            status,
            priority,
            assignees
        })
        console.log("Fetched tasks:", data);
        setTasks(data.tasks)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
        setCurrentPage(data.currentPage)
    } catch (err) {
        console.error("Error fetching tasks:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
        setLoading(false)
    }
    }, [page, limit, search, status, priority, JSON.stringify(assignees)])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    refetch: fetchTasks,
  }
}
