import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { SassClient, ClientType } from '@/lib/supabase/unified'
import { UpdateTaskSchema, DeleteTaskSchema } from '@/lib/validations/task'
import { ApiResponse } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignees(*, profiles(*)),
        comments(*, profiles(*))
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>(
        { error: 'Task not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({ data: task })
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error)
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to fetch task' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    
    const validatedData = UpdateTaskSchema.parse({ ...body, id })
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    
    const updateData: any = { id }
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.due_date !== undefined) {
      updateData.due_date = validatedData.due_date && validatedData.due_date !== '' ? validatedData.due_date : null
    }

    const task = await sassClient.updateTask(updateData, validatedData.assignees || [])

    return NextResponse.json<ApiResponse>({ 
      data: task, 
      message: 'Task updated successfully' 
    })
  } catch (error) {
    console.error('PUT /api/tasks/[id] error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to update task' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    
    const validatedData = DeleteTaskSchema.parse({ id })
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { error } = await sassClient.removeTask(validatedData.id)

    if (error) {
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to delete task' }, 
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({ 
      message: 'Task deleted successfully' 
    })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to delete task' }, 
      { status: 500 }
    )
  }
}