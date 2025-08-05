'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, isPast, differenceInHours, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface DueDateDisplayProps {
  dueDate: string
  status?: string
  className?: string
}

export function DueDateDisplay({ dueDate, status, className }: DueDateDisplayProps) {
  const date = new Date(dueDate)
  const now = new Date()
  const hoursUntilDue = differenceInHours(date, now)
  const daysUntilDue = differenceInDays(date, now)
  
  // Determine urgency and styling
  const isOverdue = isPast(date) && status !== 'Done'
  const isDueSoon = hoursUntilDue <= 72 && hoursUntilDue > 0 // Due within 72 hours
  const isDueToday = isToday(date)
  const isDueTomorrow = isTomorrow(date)
  
  // Get relative time description
  const getRelativeTime = () => {
    if (isOverdue) {
      if (isYesterday(date)) return 'Due yesterday'
      return `Overdue by ${formatDistanceToNow(date)}`
    }
    
    if (isDueToday) return 'Due today'
    if (isDueTomorrow) return 'Due tomorrow'
    
    if (daysUntilDue <= 7) {
      const dayName = format(date, 'EEEE') // e.g., "Tuesday"
      return `Due ${dayName}`
    }
    
    return `Due ${format(date, 'MMM dd')}`
  }
  
  // Get additional time context
  const getTimeContext = () => {
    if (isOverdue) return ''
    
    if (hoursUntilDue <= 24) {
      return ` • ${formatDistanceToNow(date, { addSuffix: true })}`
    }
    
    if (daysUntilDue <= 7) {
      return ` • in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
    }
    
    return ''
  }
  
  // Determine styling based on urgency
  const getChipStyle = () => {
    if (isOverdue) {
      return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300'
    }
    
    if (isDueSoon || isDueToday) {
      return 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300'
    }
    
    return 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
  }
  
  const getIcon = () => {
    if (isOverdue) return AlertTriangle
    if (isDueSoon || isDueToday) return Clock
    return Calendar
  }
  
  const Icon = getIcon()
  const relativeTime = getRelativeTime()
  const timeContext = getTimeContext()
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium gap-1 cursor-default",
              getChipStyle(),
              className
            )}
          >
            <Icon className="h-3 w-3" />
            {relativeTime}
            {timeContext}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium">
              {format(date, 'EEEE, MMMM dd, yyyy')}
            </div>
            {/* <div className="text-xs text-muted-foreground">
              {format(date, 'h:mm a')}
            </div> */}
            {isOverdue && (
              <div className="text-xs text-red-500 mt-1">
                Overdue
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}