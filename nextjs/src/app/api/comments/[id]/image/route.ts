import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse } from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
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

    const { id: commentId } = await context.params
    
    // Get the comment to check ownership and get image path
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id, image_path')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json<ApiResponse>(
        { error: 'Comment not found' }, 
        { status: 404 }
      )
    }

    // Check if user owns the comment
    if (comment.author_id !== user.id) {
      return NextResponse.json<ApiResponse>(
        { error: 'You can only delete your own comment images' }, 
        { status: 403 }
      )
    }

    // Delete image from storage if it exists
    if (comment.image_path) {
      const { error: deleteError } = await supabase.storage
        .from('comment-images')
        .remove([comment.image_path])
      
      if (deleteError) {
        console.error('Error deleting image from storage:', deleteError)
        // Continue anyway - we'll still remove the reference from the comment
      }
    }

    // Remove image reference from comment
    const { error: updateError } = await supabase
      .from('comments')
      .update({ 
        image_url: null, 
        image_path: null 
      })
      .eq('id', commentId)

    if (updateError) {
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to remove image reference' }, 
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({ 
      message: 'Image deleted successfully' 
    })
  } catch (error) {
    console.error('DELETE /api/comments/[id]/image error:', error)
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to delete image' }, 
      { status: 500 }
    )
  }
}