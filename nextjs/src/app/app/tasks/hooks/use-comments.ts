'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment, ApiResponse } from '@/lib/types'
import { CreateCommentInput, UpdateCommentInput } from '@/lib/validations/comment'

export function useComments(taskId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!taskId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/tasks/${taskId}/comments`)
      const result: ApiResponse<Comment[]> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch comments')
      }

      setComments(result.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments'
      setError(errorMessage)
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const createComment = async (content: string): Promise<Comment> => {
    const response = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const result: ApiResponse<Comment> = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create comment')
    }

    const newComment = result.data!
    setComments(prev => [...prev, newComment])
    return newComment
  }

  const updateComment = async (commentId: string, content: string): Promise<Comment> => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const result: ApiResponse<Comment> = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update comment')
    }

    const updatedComment = result.data!
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId ? updatedComment : comment
      )
    )
    return updatedComment
  }

  const deleteComment = async (commentId: string): Promise<void> => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    })

    const result: ApiResponse = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete comment')
    }

    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  const refresh = () => {
    fetchComments()
  }

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refresh,
  }
}