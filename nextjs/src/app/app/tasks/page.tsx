'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, MessageCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTasks } from './hooks/use-tasks'
import { useTaskMutations } from './hooks/use-task-mutations'
import { TaskFilters } from './components/task-filters'
import { TaskForm } from './components/task-form'
import { Pagination } from './components/pagination'
import { AvatarStack } from './components/avatar-stack'
import { StatusChip, PriorityChip } from './components/status-priority-chips'
import { DueDateDisplay } from './components/due-date-display'
import { TaskWithRelations, Profile } from '@/lib/types'
import { CreateTaskInput, UpdateTaskInput } from '@/lib/validations/task'
import TaskCommentsDialog from './task-comments-dialog'


interface TaskListItemProps {
  task: TaskWithRelations
  onEdit: (task: TaskWithRelations) => void
  onDelete: (taskId: string) => void
  onOpenComments: (task: TaskWithRelations) => void
  onStatusFilter?: (status: string) => void
  onPriorityFilter?: (priority: string) => void
}

function TaskListItem({ task, onEdit, onDelete, onOpenComments, onStatusFilter, onPriorityFilter }: TaskListItemProps) {
  const hasComments = task.comments && task.comments.length > 0

  return (
    <Card className="hover:shadow-lg transition-all duration-200 h-70 w-full flex flex-col group">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title - Always prominent */}
            <h3 className="font-semibold text-base leading-tight line-clamp-1" title={task.title}>
              {task.title}
            </h3>
            
            {/* Description - Line clamped to 2 lines */}
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" title={task.description}>
                {task.description}
              </p>
            )}
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Meta Row - Single consistent row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <StatusChip 
            status={task.status} 
            onClick={() => onStatusFilter?.(task.status)}
          />
          <PriorityChip 
            priority={task.priority} 
            onClick={() => onPriorityFilter?.(task.priority)}
          />
          
          {/* Assignees Avatar Stack */}
          {task.task_assignees && task.task_assignees.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <AvatarStack assignees={task.task_assignees} maxVisible={3} />
            </>
          )}
          
          {/* Due Date */}
          {task.due_date && (
            <>
              <div className="h-4 w-px bg-border" />
              <DueDateDisplay dueDate={task.due_date} status={task.status} />
            </>
          )}
        </div>

        {/* Spacer to push comments to bottom */}
        <div className="flex-1" />

        {/* Comments Footer - Only show if comments exist */}
        {hasComments && (
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenComments(task)}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {task.comments?.length} comment{task.comments?.length === 1 ? '' : 's'}
            </Button>
          </div>
        )}
        
        {/* Add comment affordance for tasks without comments */}
        {!hasComments && (
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenComments(task)}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Add comment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
export default function TaskManagementPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [commentsTask, setCommentsTask] = useState<TaskWithRelations | null>(null)
  const [error, setError] = useState<string>('')

  const { 
    tasks, 
    loading, 
    error: tasksError, 
    meta, 
    query, 
    updateQuery, 
    goToPage, 
    refresh 
  } = useTasks()

  const { createTask, updateTask, deleteTask, loading: mutationLoading } = useTaskMutations()

  // Fetch users for assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const result = await response.json()
        if (result.data) {
          setUsers(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)
      }
    }
    fetchUsers()
  }, [])

  const handleCreateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    try {
      setError('')
      await createTask(data as CreateTaskInput)
      setCreateDialogOpen(false)
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      setError(message)
      throw err
    }
  }

  const handleUpdateTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    try {
      setError('')
      await updateTask(data as UpdateTaskInput)
      setEditingTask(null)
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      throw err
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      setError('')
      await deleteTask(taskId)
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      setError(message)
    }
  }

  const displayError = error || tasksError

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <p className="text-muted-foreground">
              Manage your tasks with advanced filtering, search, and collaboration features
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                users={users}
                onSubmit={handleCreateTask}
                onCancel={() => setCreateDialogOpen(false)}
                loading={mutationLoading}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <TaskFilters
            query={query}
            onQueryChange={updateQuery}
            users={users}
          />

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tasks found</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first task
              </Button>
            </div>
          ) : (
            <>
              {/* Task Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onOpenComments={setCommentsTask}
                  />
                ))}
              </div>

              <Pagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                totalCount={meta.totalCount}
                onPageChange={goToPage}
                pageSize={query.limit || 10}
                onPageSizeChange={(size) => updateQuery({ limit: size })}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              users={users}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              loading={mutationLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Comments Dialog */}
      {commentsTask && (
        <TaskCommentsDialog
          task={commentsTask}
          open={!!commentsTask}
          onOpenChange={(open) => !open && setCommentsTask(null)}
          onCommentAdded={() => {
            // Optionally update the task in the list to reflect new comment count
            refresh()
          }}
        />
      )}
    </div>
  )

}



