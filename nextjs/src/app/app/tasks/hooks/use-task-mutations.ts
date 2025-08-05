'use client'

import { useState } from 'react'
import { Task, ApiResponse } from '@/lib/types'
import { CreateTaskInput, UpdateTaskInput } from '@/lib/validations/task'

export function useTaskMutations() {
  const [loading, setLoading] = useState(false)

  const createTask = async (data: CreateTaskInput): Promise<Task> => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Task> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task')
      }

      return result.data!
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (data: UpdateTaskInput): Promise<Task> => {
    setLoading(true)
    try {
      const { id, ...updateData } = data
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const result: ApiResponse<Task> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task')
      }

      return result.data!
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: string): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete task')
      }
    } finally {
      setLoading(false)
    }
  }

  const assignUsers = async (taskId: string, userIds: string[]): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign users')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    createTask,
    updateTask,
    deleteTask,
    assignUsers,
    loading,
  }
}