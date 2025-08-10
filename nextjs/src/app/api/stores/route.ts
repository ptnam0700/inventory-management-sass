// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Store, StoresResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
        const supabase = await createSSRClient()
    
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const is_active = searchParams.get('is_active')
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('stores')
      .select(`
        *,
        profiles:manager_id(id, name, email)
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`)
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true')
    }

    const { data: stores, count, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: ApiResponse<StoresResponse> = {
      data: {
        stores: stores || [],
        totalCount: count || 0,
        totalPages,
        currentPage: page
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
        const supabase = await createSSRClient()

    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      location,
      phone,
      email,
      manager_id,
      is_active = true
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    const { data: store, error } = await supabase
      .from('stores')
      .insert([{
        name,
        location,
        phone,
        email,
        manager_id,
        is_active
      }])
      .select(`
        *,
        profiles:manager_id(id, name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Store> = {
      data: store,
      message: 'Store created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}