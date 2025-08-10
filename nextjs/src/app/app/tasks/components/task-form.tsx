'use client'

import { useState } from 'react'
import { Loader2, Calendar, X, Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { CreateTaskInput, UpdateTaskInput } from '@/lib/validations/task'
import { TaskWithRelations, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TaskFormProps {
  task?: TaskWithRelations
  users?: Profile[]
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const statusOptions = [
  { value: 'Todo', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
]

const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

export function TaskForm({ task, users = [], onSubmit, onCancel, loading = false }: TaskFormProps) {
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [dueDateOpen, setDueDateOpen] = useState(false)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task?.task_assignees?.map(a => a.user_id) || []
  )
  const [error, setError] = useState<string>('')

  const isEditing = !!task

  // Form state
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Todo',
    priority: task?.priority || 'Medium',
    due_date: task?.due_date || '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAssigneeToggle = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAssigneeRemove = (userId: string) => {
    setSelectedAssignees(prev => prev.filter(id => id !== userId))
  }

  const handleDueDateSelect = (date: Date | undefined) => {
    handleInputChange('due_date', date ? date.toISOString() : '')
    setDueDateOpen(false)
  }

  const getSelectedUsers = () => {
    return users.filter(user => selectedAssignees.includes(user.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      const submitData = {
        ...formData,
        assignees: selectedAssignees,
        ...(isEditing && { id: task.id })
      }

      await onSubmit(submitData as CreateTaskInput | UpdateTaskInput)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignees */}
      <div className="space-y-2">
        <Label>Assignees</Label>
        <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedAssignees.length === 0 ? (
                "Select assignees..."
              ) : (
                <div className="flex flex-wrap gap-1">
                  {getSelectedUsers().slice(0, 2).map((user) => (
                    <Badge key={user.id} variant="secondary" className="text-xs">
                      {user.name || user.email?.split('@')[0]?.replace(/[._]/g, ' ')
                        .split(' ')
                        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                        .join(' ') || 'Unknown'}
                    </Badge>
                  ))}
                  {selectedAssignees.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedAssignees.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandList>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => handleAssigneeToggle(user.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAssignees.includes(user.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>
                          {user.name || user.email?.split('@')[0]?.replace(/[._]/g, ' ')
                            .split(' ')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                            .join(' ') || 'Unknown'}
                        </span>
                        {user.name && (
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected assignees display */}
        {selectedAssignees.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {getSelectedUsers().map((user) => (
              <Badge key={user.id} variant="secondary" className="text-xs">
                {user.name || user.email?.split('@')[0]?.replace(/[._]/g, ' ')
                  .split(' ')
                  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ') || 'Unknown'}
                <button
                  type="button"
                  onClick={() => handleAssigneeRemove(user.id)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.due_date && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formData.due_date ? format(new Date(formData.due_date), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={formData.due_date ? new Date(formData.due_date) : undefined}
              onSelect={handleDueDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {formData.due_date && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleInputChange('due_date', '')}
            className="text-xs text-muted-foreground"
          >
            Clear date
          </Button>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}