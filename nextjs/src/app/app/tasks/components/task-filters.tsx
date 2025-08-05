'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { TaskQueryInput } from '@/lib/validations/task'
import { Profile } from '@/lib/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskFiltersProps {
  query: Partial<TaskQueryInput>
  onQueryChange: (query: Partial<TaskQueryInput>) => void
  users?: Profile[]
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Todo', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
]

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

const sortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
]

export function TaskFilters({ query, onQueryChange, users = [] }: TaskFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [dueDateFromOpen, setDueDateFromOpen] = useState(false)
  const [dueDateToOpen, setDueDateToOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onQueryChange({ search: value })
  }

  const handleStatusChange = (value: string) => {
    onQueryChange({ status: value as any })
  }

  const handlePriorityChange = (value: string) => {
    onQueryChange({ priority: value as any })
  }

  const handleAssigneeChange = (userId: string) => {
    onQueryChange({ assignee: userId === query.assignee ? undefined : userId })
  }

  const handleSortChange = (value: string) => {
    onQueryChange({ sort: value as any })
  }

  const handleOrderChange = (value: string) => {
    onQueryChange({ order: value as any })
  }

  const handleDueDateFromChange = (date: Date | undefined) => {
    onQueryChange({ due_from: date?.toISOString() })
  }

  const handleDueDateToChange = (date: Date | undefined) => {
    onQueryChange({ due_to: date?.toISOString() })
  }

  const clearFilters = () => {
    onQueryChange({
      search: '',
      status: 'all',
      priority: 'all',
      assignee: undefined,
      due_from: undefined,
      due_to: undefined,
      sort: 'created_at',
      order: 'desc',
    })
  }

  const hasActiveFilters = 
    query.search || 
    (query.status && query.status !== 'all') ||
    (query.priority && query.priority !== 'all') ||
    query.assignee ||
    query.due_from ||
    query.due_to

  const selectedUser = users.find(u => u.id === query.assignee)

  return (
    <div className="space-y-4">
      {/* Main search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={query.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick filters */}
        <div className="flex gap-2">
          <Select value={query.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={query.priority || 'all'} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Assignee filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assignee</Label>
              <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedUser ? selectedUser.email : "Any assignee"}
                    <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => handleAssigneeChange('')}>
                          Any assignee
                        </CommandItem>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => handleAssigneeChange(user.id)}
                          >
                            {user.email}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Due date from */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Due From</Label>
              <Popover open={dueDateFromOpen} onOpenChange={setDueDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !query.due_from && "text-muted-foreground"
                    )}
                  >
                    {query.due_from ? format(new Date(query.due_from), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={query.due_from ? new Date(query.due_from) : undefined}
                    onSelect={handleDueDateFromChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due date to */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Due To</Label>
              <Popover open={dueDateToOpen} onOpenChange={setDueDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !query.due_to && "text-muted-foreground"
                    )}
                  >
                    {query.due_to ? format(new Date(query.due_to), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={query.due_to ? new Date(query.due_to) : undefined}
                    onSelect={handleDueDateToChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sort options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sort</Label>
              <div className="flex gap-2">
                <Select value={query.sort || 'created_at'} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={query.order || 'desc'} onValueChange={handleOrderChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {query.search && (
                <Badge variant="secondary">
                  Search: {query.search}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
              {query.status && query.status !== 'all' && (
                <Badge variant="secondary">
                  Status: {query.status}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleStatusChange('all')}
                  />
                </Badge>
              )}
              {query.priority && query.priority !== 'all' && (
                <Badge variant="secondary">
                  Priority: {query.priority}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handlePriorityChange('all')}
                  />
                </Badge>
              )}
              {selectedUser && (
                <Badge variant="secondary">
                  Assignee: {selectedUser.email}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleAssigneeChange('')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}