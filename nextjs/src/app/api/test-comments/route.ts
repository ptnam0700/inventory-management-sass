import { NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test basic table access
    console.log('Testing comments table access...')
    
    // 1. Test if we can read comments table
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(5)
    
    console.log('Comments query result:', { comments, error: commentsError })
    
    // 2. Test if we can read profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('Profiles query result:', { profiles, error: profilesError })
    
    // 3. Test if we can read tasks table
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5)
    
    console.log('Tasks query result:', { tasks, error: tasksError })

    return NextResponse.json({
      user: user.id,
      comments: { data: comments, error: commentsError },
      profiles: { data: profiles, error: profilesError },
      tasks: { data: tasks, error: tasksError }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 })
  }
}