"use client"

import { useState, useCallback } from "react"

import { Search, Filter, MoreHorizontal, Edit, Trash2, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import TaskDialog from "./task-dialog"
import TaskCommentsDialog from "./task-comments-dialog"

import { Task, TaskAssignee, TaskPriority, TaskStatus } from '@/lib/types';
import { useTasks } from "../hooks/use-tasks";
import {
  createSPASassClientAuthenticated as createSPASassClient
} from '@/lib/supabase/client';
import { useUsers } from "../hooks/use-users";
import { PaginationWithLinks } from "@/components/ui/pagination-with-link";
import { useSearchParams } from "next/navigation";


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

// interface TaskListProps {
//   searchParams: { [key: string]: string | undefined }  
// }


export default function TaskList() {

  // Pagination and filter states
  const searchParams = useSearchParams()
  const currentPage = searchParams.get('page') ?? '1'
  const itemsPerPage = searchParams.get('pageSize') ?? '6'

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([])

  // UI states
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [commentsTask, setCommentsTask] = useState<Task | null>(null)
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // Fetch tasks with current filters
  const { tasks, totalCount, refetch } = useTasks({
    page: Number(currentPage),
    limit: Number(itemsPerPage),
    search: searchQuery,
    status: statusFilter,
    priority: priorityFilter,
    assignees: assigneeFilter,
  })

  // Fetch users for assignee filter
  const { users } = useUsers()

  // Filter and search logic
  // const filteredTasks = useMemo(() => {
  //   return tasks.filter((task) => {
  //     const matchesSearch =
  //       task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       task.description?.toLowerCase().includes(searchQuery.toLowerCase())

  //     const matchesStatus = statusFilter === "all" || task.status === statusFilter
  //     const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
  //     const matchesAssignee =
  //       assigneeFilter.length === 0 || assigneeFilter.some((assigneeId) => task.task_assignees?.map((x) => x.user_id).includes(assigneeId))

  //     return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  //   })
  // }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, currentPage])

  const handleTaskCreated = useCallback(
    async () => {
      await refetch()
    },
    [refetch],
  )

  const handleTaskUpdate = useCallback(
    async () => {
      setEditingTask(null)
      await refetch()
    },
    [refetch],
  )

  const handleTaskDelete = async (taskId: string) => {
    try {
      const supabase = await createSPASassClient();
      const { error: supabaseError } = await supabase.removeTask(taskId);
      if (supabaseError) throw supabaseError;
      await refetch();
    } catch (err) {
      console.error('Error removing task:', err);
    }
  }

  const toggleAssigneeFilter = (assigneeId: string) => {
    setAssigneeFilter((prev) =>
      prev.includes(assigneeId) ? prev.filter((id) => id !== assigneeId) : [...prev, assigneeId],
    )
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setAssigneeFilter([])
    setSearchQuery("")
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return <Badge className={cn("text-xs", statusOption?.color)}>{statusOption?.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityOption = priorityOptions.find((opt) => opt.value === priority)
    return <Badge className={cn("text-xs", priorityOption?.color)}>{priorityOption?.label}</Badge>
  }

  const getAssigneeEmails = (task_assignees: TaskAssignee[]) => {
    return task_assignees
      .map((assignees) => assignees.profiles?.email)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                  <p className="text-gray-600 mt-2">Manage and track your team&apos;s tasks efficiently</p>
                </div>
                <TaskDialog mode="add" onTaskCreated={handleTaskCreated} />
      </div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
            <p className="text-muted-foreground">
              {tasks?.length} of {totalCount} tasks
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters */}
            <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {assigneeFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {assigneeFilter.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Assignees</Label>
                    <div className="mt-2 space-y-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`assignee-${user.id}`}
                            checked={assigneeFilter.includes(user.id)}
                            onCheckedChange={() => toggleAssigneeFilter(user.id)}
                          />
                          <Label htmlFor={`assignee-${user.id}`} className="text-sm">
                            {user.email}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button size="sm" onClick={() => setFilterPopoverOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks?.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>
                    {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTaskDelete(task.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status and Priority */}
                  <div className="flex gap-2">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>

                  {/* Assignees */}
                  {task.task_assignees && task?.task_assignees?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Assigned to:</p>
                      <p className="text-xs font-medium">{getAssigneeEmails(task.task_assignees)}</p>
                    </div>
                  )}

                  {/* Due Date */}
                  {task.due_date && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Due date:</p>
                        <p
                          className={cn(
                            "text-xs font-medium",
                            new Date(task.due_date) < new Date() && task.status !== "Done" ? "text-red-600" : "",
                          )}
                        >
                          {format(new Date(task.due_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}

                  {/* Comments */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommentsTask(task)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {task.comments?.length || 0} comments
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!tasks && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks</p>
          </div>
        )}

        {/* Empty State */}
        {tasks?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found matching your criteria.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-2 bg-transparent">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(Number(currentPage) - 1) * Number(itemsPerPage) + 1} to {Math.min(Number(currentPage) * Number(itemsPerPage), totalCount)} of{" "}
            {totalCount} tasks
          </p>
          <div className="flex items-center space-x-2">
            <PaginationWithLinks
              page={Number(currentPage)}
              pageSize={Number(itemsPerPage)}
              totalCount={totalCount}
              pageSizeSelectOptions={{
                pageSizeOptions: [6, 12, 24, 50],
              }}
            />
          </div>
        </div>

        {/* Edit Task Dialog */}
        {editingTask && (
          <TaskDialog
            mode="edit"
            task={editingTask as unknown as Task & { task_assignees: TaskAssignee[] }}
            open={!!editingTask}
            onOpenChange={(open) => !open && setEditingTask(null)}
            onTaskUpdated={handleTaskUpdate}
          />
        )}

        {/* Comments Dialog */}
        {commentsTask && (
          <TaskCommentsDialog
            task={commentsTask}
            open={!!commentsTask}
            onOpenChange={(open) => !open && setCommentsTask(null)}
            onCommentAdded={(updatedTask) => {
              setCommentsTask(updatedTask)
            }}
          />
        )}
      </div>
    </div>
  )
}
