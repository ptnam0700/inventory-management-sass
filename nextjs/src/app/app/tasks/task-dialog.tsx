"use client"

import type React from "react"

import { useGlobal } from '@/lib/context/GlobalContext';
import {
  createSPASassClientAuthenticated as createSPASassClient
} from '@/lib/supabase/client';
import { Database, TaskPriority, TaskStatus } from '@/lib/types';

import { useState, useEffect } from "react"
import { Plus, Loader2, AlertCircle, Calendar, Check, ChevronsUpDown, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useUsers } from "../hooks/use-users";

// Mock data - replace with your actual data
const statusOptions = [
  { value: "Todo", label: "To Do" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
]

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
]

type Task = Database['public']['Tables']['tasks']['Row'];
type NewTask = Database['public']['Tables']['tasks']['Insert'];
type UpdateTask = Database['public']['Tables']['tasks']['Update'];

interface TaskDialogProps {
  // For Add mode
  trigger?: React.ReactNode
  onTaskCreated?: () => Promise<void>

  // For Edit mode
  task?: Task
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onTaskUpdated?: (task: UpdateTask) => Promise<void>

  // Common
  mode: "add" | "edit"
}

export default function TaskDialog({
  trigger,
  onTaskCreated,
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  mode,
}: TaskDialogProps) {
  // Mock user - replace with your useGlobal hook
  const { user } = useGlobal();

  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Form state
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [status, setStatus] = useState<TaskStatus>("Todo")
  const [assignees, setAssignees] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<TaskPriority>("Medium")

  // UI state
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false)
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false)

  // Fetch users for assignee selection
  const { users } = useUsers()
  
  // Determine if we're using internal or external open state
  const isOpen = mode === "edit" ? (open ?? false) : internalOpen
  const setIsOpen = mode === "edit" ? (onOpenChange ?? (() => {})) : setInternalOpen

  // Initialize form with task data for edit mode
  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "todo")
      setAssignees(task.task_assignees.map((assignee) => assignee?.profiles?.id) || [])
      setDueDate(task.due_date ? new Date(task.due_date) : undefined)
      setPriority(task.priority || "Medium")
    } else if (mode === "add") {
      // Reset form for add mode
      resetForm()
    }
  }, [task, mode, isOpen])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus("Todo")
    setAssignees([])
    setDueDate(undefined)
    setPriority("Medium")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !user?.id) return

    try {
      setLoading(true)
      setError("")
      const supabase = await createSPASassClient();

      if (mode === "add") {
        // Create new task
        const newTask: NewTask = {
            title: title.trim(),
            description: description.trim() || null,
            status,
            due_date: dueDate || null,
            priority,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        const { error: supabaseError } = await supabase.createTaskWithAssignees(newTask, assignees);
        if (supabaseError) throw supabaseError;

        resetForm()
        setIsOpen(false)
        if (onTaskCreated) await onTaskCreated()
      } else {
        // Update existing task
        const updatedTask: UpdateTask = {
          id: task!.id,
          title: title.trim(),
          description: description.trim() || null,
          status,
          due_date: dueDate || null,
          priority,
          updated_at: new Date().toISOString(),
        }

        const { error: supabaseError } = await supabase.updateTask(updatedTask, assignees);
        if (supabaseError) throw supabaseError;
        console.log("Updating task:", updatedTask)

        if (onTaskUpdated) await onTaskUpdated(updatedTask)
      }
    } catch (err) {
      setError(`Failed to ${mode === "add" ? "create" : "update"} task`)
      console.error(`Error ${mode === "add" ? "creating" : "updating"} task:`, err)
    } finally {
      setLoading(false)
    }
  }

  const toggleAssignee = (memberId: string) => {
    setAssignees((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const removeAssignee = (memberId: string) => {
    setAssignees((prev) => prev.filter((id) => id !== memberId))
  }

  const getSelectedAssignees = () => {
    return users.filter((member) => assignees.includes(member.id))
  }

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{mode === "add" ? "Create New Task" : "Edit Task"}</DialogTitle>
      </DialogHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
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

        {/* Assignees */}
        <div className="space-y-2">
          <Label>Assignees</Label>
          <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={assigneePopoverOpen}
                className="w-full justify-between bg-transparent"
              >
                {assignees.length === 0 ? (
                  "Select assignees..."
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {getSelectedAssignees()
                      .slice(0, 2)
                      .map((member) => (
                        <Badge key={member.id} variant="secondary" className="text-xs">
                          {member.email}
                        </Badge>
                      ))}
                    {assignees.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{assignees.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search team members..." />
                <CommandList>
                  <CommandEmpty>No team member found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem key={user.id} onSelect={() => toggleAssignee(user.id)}>
                        <Check
                          className={cn("mr-2 h-4 w-4", assignees.includes(user.id) ? "opacity-100" : "opacity-0")}
                        />
                        <div className="flex flex-col">
                          <span>{user.email}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected assignees */}
          {assignees.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {getSelectedAssignees().map((user) => (
                <Badge key={user.id} variant="secondary" className="text-xs">
                  {user.email}
                  <button
                    type="button"
                    onClick={() => removeAssignee(user.id)}
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
          <Popover open={dueDatePopoverOpen} onOpenChange={setDueDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date)
                  setDueDatePopoverOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {dueDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDueDate(undefined)}
              className="text-xs text-muted-foreground"
            >
              Clear date
            </Button>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "add" ? "Create Task" : "Update Task"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )

  // For add mode, wrap with Dialog and trigger
  if (mode === "add") {
    return (
      <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="bg-primary-600 text-white hover:bg-primary-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    )
  }

  // For edit mode, just return the dialog content
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  )
}
