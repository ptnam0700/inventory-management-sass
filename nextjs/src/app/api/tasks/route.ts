import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { SassClient, ClientType } from '@/lib/supabase/unified'
import { CreateTaskSchema, TaskQuerySchema } from '@/lib/validations/task'
import { ApiResponse, TasksResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = TaskQuerySchema.parse(queryParams)
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const result = await sassClient.getTasks({
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      search: validatedQuery.search,
      status: validatedQuery.status,
      priority: validatedQuery.priority,
      assignees: validatedQuery.assignee ? [validatedQuery.assignee] : [],
    })

    const response: TasksResponse = {
      tasks: result.tasks || [],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    }

    return NextResponse.json<ApiResponse<TasksResponse>>({ data: response })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateTaskSchema.parse(body)
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    
    const taskData = {
      title: validatedData.title,
      description: validatedData.description || null,
      status: validatedData.status,
      priority: validatedData.priority,
      due_date: validatedData.due_date && validatedData.due_date !== '' ? validatedData.due_date : null,
      created_by: user.id,
    }

    const task = await sassClient.createTaskWithAssignees(taskData, validatedData.assignees)

    return NextResponse.json<ApiResponse>({ 
      data: task, 
      message: 'Task created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to create task' }, 
      { status: 500 }
    )
  }
}