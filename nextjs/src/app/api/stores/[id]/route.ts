// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Store } from '@/lib/types'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
        const supabase = await createSSRClient()
    
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select(`
        *,
        profiles:manager_id(id, name, email)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Store> = {
      data: store
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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
      is_active
    } = body

    const { data: store, error } = await supabase
      .from('stores')
      .update({
        name,
        location,
        phone,
        email,
        manager_id,
        is_active
      })
      .eq('id', id)
      .select(`
        *,
        profiles:manager_id(id, name, email)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Store> = {
      data: store,
      message: 'Store updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
        const supabase = await createSSRClient()

    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if store has stock or transactions
    const { data: stock, error: stockError } = await supabase
      .from('stock')
      .select('quantity')
      .eq('store_id', id)
      .gt('quantity', 0)
      .limit(1)

    if (stockError) {
      return NextResponse.json(
        { error: stockError.message },
        { status: 500 }
      )
    }

    if (stock && stock.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete store with existing stock. Consider deactivating instead.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse = {
      message: 'Store deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}