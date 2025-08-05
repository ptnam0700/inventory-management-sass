import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { SassClient, ClientType } from '@/lib/supabase/unified'
import { AssignTaskSchema } from '@/lib/validations/task'
import { ApiResponse } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: taskId } = await context.params
    const body = await request.json()
    
    const validatedData = AssignTaskSchema.parse({ taskId, userIds: body.userIds || [] })
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { error } = await sassClient.assignUsersToTask(validatedData.taskId, validatedData.userIds)

    if (error) {
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to assign users to task' }, 
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({ 
      message: 'Task assignment updated successfully' 
    })
  } catch (error) {
    console.error('POST /api/tasks/[id]/assign error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to assign users to task' }, 
      { status: 500 }
    )
  }
}