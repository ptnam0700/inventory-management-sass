"use client"

import type React from "react"

import { useState } from "react"
import { Send, MessageCircle, User, Loader2, AlertCircle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGlobal } from "@/lib/context/GlobalContext"
import { useComments } from "./hooks/use-comments"
import { Task } from "@/lib/types"


const statusOptions = [
  { value: "Todo", label: "To Do", color: "bg-gray-100 text-gray-800" },
  { value: "In Progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "Done", label: "Done", color: "bg-green-100 text-green-800" },
]

const priorityOptions = [
  { value: "Low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "Medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "High", label: "High", color: "bg-red-100 text-red-800" },
]

interface TaskCommentsDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentAdded?: (task: Task) => void
}

export default function TaskCommentsDialog({ task, open, onOpenChange, onCommentAdded }: TaskCommentsDialogProps) {
  const { user: currentUser } = useGlobal();
  
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState("")

  const {
    comments,
    loading,
    error: commentsError,
    createComment,
    updateComment,
    deleteComment,
    refresh,
  } = useComments(task.id)

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return (
      <Badge className={`text-xs ${statusOption?.color}`} variant="secondary">
        {statusOption?.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityOption = priorityOptions.find((opt) => opt.value === priority)
    return (
      <Badge className={`text-xs ${priorityOption?.color}`} variant="secondary">
        {priorityOption?.label}
      </Badge>
    )
  }

  const getAssigneeNames = () => {
    if (!task.task_assignees || task.task_assignees.length === 0) {
      return 'Unassigned'
    }
    
    return task.task_assignees
      .map(assignee => {
        const profile = assignee.profiles
        if (!profile) return 'Unknown'
        
        // If user has a name, use it; otherwise use default from email
        if (profile.name) {
          return profile.name
        }
        
        // Generate default name from email
        if (profile.email) {
          const emailPart = profile.email.split('@')[0]
          return emailPart.replace(/[._]/g, ' ')
            .split(' ')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
        }
        
        return 'Unknown'
      })
      .join(', ')
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || loading) return

    try {
      setError('')
      await createComment(newComment.trim())
      setNewComment('')
      
      // Optionally notify parent component
      if (onCommentAdded) {
        const updatedTask = {
          ...task,
          comments: [...(task.comments || []), {
            id: 'temp',
            task_id: task.id,
            author_id: currentUser!.id,
            content: newComment.trim(),
            created_at: new Date().toISOString(),
            profiles: { id: currentUser!.id, email: currentUser!.email }
          }]
        }
        onCommentAdded(updatedTask)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create comment'
      setError(message)
      console.error('Error adding comment:', err)
    }
  }

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
};

  const sortedComments = comments.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const displayError = error || commentsError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Task Comments
          </DialogTitle>
        </DialogHeader>

        {displayError && (
          <Alert variant="destructive" className="flex-shrink-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Task Summary */}
        <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{task.title}</h3>
            {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>

          {task.task_assignees && task.task_assignees.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Assigned to:</p>
              <p className="text-sm font-medium">{getAssigneeNames()}</p>
            </div>
          )}

          {task.due_date && (
            <div>
              <p className="text-xs text-muted-foreground">Due date:</p>
              <p className="text-sm font-medium">{format(new Date(task.due_date), "MMM dd, yyyy")}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Comments ({sortedComments.length})</h4>
          </div>

          {/* Comments List */}
          <div className="flex-1 min-h-0 overflow-scroll">
            <ScrollArea className="flex-1 pr-4">
              <div className="pr-4">
                {loading && sortedComments.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading comments...</p>
                  </div>
                ) : sortedComments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to add a comment!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedComments.map((comment, index: number) => {
                      const isCurrentUser = comment.author_id === currentUser!.id
                      const profile = comment.profiles
                      
                      // Get display name - prefer name, fallback to email-derived name
                      const commentAuthor = (() => {
                        if (!profile) return 'Unknown User'
                        
                        if (profile.name) {
                          return profile.name
                        }
                        
                        if (profile.email) {
                          const emailPart = profile.email.split('@')[0]
                          return emailPart.replace(/[._]/g, ' ')
                            .split(' ')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                            .join(' ')
                        }
                        
                        return 'Unknown User'
                      })()

                      return (
                        <div key={comment.id} className="space-y-2">
                          <div className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-medium">
                                    {getInitials(commentAuthor)}
                                </span>
                            </div>

                            <div className={`flex-1 ${isCurrentUser ? "text-right" : ""}`}>
                              <div
                                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                              </div>

                              <div className={`mt-1 text-xs text-muted-foreground ${isCurrentUser ? "text-right" : ""}`}>
                                <span className="font-medium">{commentAuthor}</span>
                                <span className="mx-1">•</span>
                                <span title={format(new Date(comment.created_at), "PPpp")}>
                                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {index < sortedComments.length - 1 && <Separator className="my-4" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Add Comment Form */}
          <div className="flex-shrink-0 mt-4 pt-4 border-t">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                        {currentUser ? getInitials(currentUser.email) : '??'}
                    </span>
                </div>

                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!newComment.trim() || loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
