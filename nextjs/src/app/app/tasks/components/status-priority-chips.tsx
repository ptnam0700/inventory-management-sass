'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Circle, AlertTriangle, Flag, CheckCircle2, Clock, Play } from 'lucide-react'
import { TaskStatus, TaskPriority } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusChipProps {
  status: TaskStatus
  onClick?: () => void
  className?: string
}

interface PriorityChipProps {
  priority: TaskPriority
  onClick?: () => void
  className?: string
}

const statusConfig = {
  'Todo': {
    label: 'To Do',
    icon: Circle,
    color: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    darkColor: 'dark:bg-slate-800 dark:text-slate-300'
  },
  'In Progress': {
    label: 'In Progress',
    icon: Play,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    darkColor: 'dark:bg-blue-900/50 dark:text-blue-300'
  },
  'Done': {
    label: 'Done',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    darkColor: 'dark:bg-green-900/50 dark:text-green-300'
  }
} as const

const priorityConfig = {
  'Low': {
    label: 'Low',
    icon: Flag,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    darkColor: 'dark:bg-gray-800 dark:text-gray-300'
  },
  'Medium': {
    label: 'Medium',
    icon: Flag,
    color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    darkColor: 'dark:bg-amber-900/50 dark:text-amber-300'
  },
  'High': {
    label: 'High',
    icon: Flag,
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    darkColor: 'dark:bg-red-900/50 dark:text-red-300'
  }
} as const

export function StatusChip({ status, onClick, className }: StatusChipProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium gap-1 cursor-pointer transition-colors",
              config.color,
              config.darkColor,
              onClick && "hover:scale-105",
              className
            )}
            onClick={onClick}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Status: {config.label}</p>
          {onClick && <p className="text-xs text-muted-foreground">Click to filter</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PriorityChip({ priority, onClick, className }: PriorityChipProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium gap-1 cursor-pointer transition-colors",
              config.color,
              config.darkColor,
              onClick && "hover:scale-105",
              className
            )}
            onClick={onClick}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Priority: {config.label}</p>
          {onClick && <p className="text-xs text-muted-foreground">Click to filter</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}