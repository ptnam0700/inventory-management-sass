'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Profile } from '@/lib/types'

interface AvatarStackProps {
  assignees: Array<{ profiles?: Profile }>
  maxVisible?: number
  size?: 'sm' | 'md'
}

const getDisplayName = (profile?: Profile) => {
  if (!profile) return 'Unknown'
  
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
  
  return 'Unknown'
}

const getInitials = (profile?: Profile) => {
  if (!profile) return '??'
  
  const name = getDisplayName(profile)
  const parts = name.split(' ')
  
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return parts[0].slice(0, 2).toUpperCase()
}

export function AvatarStack({ assignees, maxVisible = 3, size = 'sm' }: AvatarStackProps) {
  if (!assignees || assignees.length === 0) {
    return null
  }

  const visibleAssignees = assignees.slice(0, maxVisible)
  const remainingCount = Math.max(0, assignees.length - maxVisible)
  
  const avatarSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-1">
        {visibleAssignees.map((assignee, index) => {
          const profile = assignee.profiles
          const displayName = getDisplayName(profile)
          const initials = getInitials(profile)
          
          return (
            <Tooltip key={profile?.id || index}>
              <TooltipTrigger asChild>
                <Avatar className={`${avatarSize} border-2 border-background ring-1 ring-border`}>
                  <AvatarFallback className={`${textSize} font-medium bg-primary/10 text-primary`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{displayName}</div>
                  {profile?.name && profile?.email && (
                    <div className="text-xs text-muted-foreground">{profile.email}</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className={`${avatarSize} rounded-full p-0 border-2 border-background ring-1 ring-border text-xs font-medium flex items-center justify-center`}
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {assignees.slice(maxVisible).map((assignee, index) => (
                  <div key={assignee.profiles?.id || index} className="text-sm">
                    {getDisplayName(assignee.profiles)}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}