import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { SassClient, ClientType } from '@/lib/supabase/unified'
import { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSSRClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse>({ error: 'Unauthorized' }, { status: 401 })
    }

    const sassClient = new SassClient(supabase, ClientType.SERVER)
    const { data: profiles, error } = await sassClient.getAllUsers()

    if (error) {
      return NextResponse.json<ApiResponse>(
        { error: 'Failed to fetch users' }, 
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({ data: profiles })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json<ApiResponse>(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    )
  }
}