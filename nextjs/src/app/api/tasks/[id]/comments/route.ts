import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { SassClient, ClientType } from '@/lib/supabase/unified'
import { CreateCommentSchema } from '@/lib/validations/comment'
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
      console.error('Auth error in GET comments:', authError)
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: taskId } = await context.params
    console.log('Fetching comments for task:', taskId)
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { data: comments, error } = await sassClient.getCommentsByTaskId(taskId)

    if (error) {
      console.error('Error fetching comments from database:', error)
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to fetch comments' }, 
        { status: 500 }
      )
    }

    console.log('Successfully fetched comments:', comments?.length || 0)
    return NextResponse.json<ApiResponse>({ data: comments })
  } catch (error) {
    console.error('GET /api/tasks/[id]/comments error:', error)
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to fetch comments' }, 
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error in POST comment:', authError)
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: taskId } = await context.params
    const body = await request.json()
    
    console.log('Creating comment for task:', taskId, 'by user:', user.id)
    
    const validatedData = CreateCommentSchema.parse({ 
      task_id: taskId, 
      content: body.content 
    })
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { data: comment, error } = await sassClient.createComment({
      task_id: validatedData.task_id,
      author_id: user.id,
      content: validatedData.content,
    })

    if (error) {
      console.error('Error creating comment in database:', error)
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to create comment', message: error.message }, 
        { status: 500 }
      )
    }

    console.log('Successfully created comment:', comment?.id)
    return NextResponse.json<ApiResponse>({ 
      data: comment, 
      message: 'Comment created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks/[id]/comments error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to create comment' }, 
      { status: 500 }
    )
  }
}