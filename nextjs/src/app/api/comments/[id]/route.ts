import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { SassClient, ClientType } from '@/lib/supabase/unified'
import { UpdateCommentSchema, DeleteCommentSchema } from '@/lib/validations/comment'
import { ApiResponse } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
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
    
    const validatedData = UpdateCommentSchema.parse({ 
      id, 
      content: body.content 
    })
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { data: comment, error } = await sassClient.updateComment(validatedData)

    if (error) {
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to update comment' }, 
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({ 
      data: comment, 
      message: 'Comment updated successfully' 
    })
  } catch (error) {
    console.error('PUT /api/comments/[id] error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to update comment' }, 
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
    
    const validatedData = DeleteCommentSchema.parse({ id })
    
    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { error } = await sassClient.deleteComment(validatedData.id)

    if (error) {
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to delete comment' }, 
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({ 
      message: 'Comment deleted successfully' 
    })
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { error: 'Validation error', message: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to delete comment' }, 
      { status: 500 }
    )
  }
}