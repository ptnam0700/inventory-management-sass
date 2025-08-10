// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Return, ReturnsResponse } from '@/lib/types'

interface ReturnItem {
  product_id: string
  quantity: number
  unit_price: number
  condition: string
  reason: string
}

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
    const store_id = searchParams.get('store_id')
    const return_type = searchParams.get('return_type')
    const status = searchParams.get('status')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('returns')
      .select(`
        *,
        store:stores(id, name, location),
        sale:sales(id, invoice_number, customer_name),
        created_by_profile:profiles!created_by(id, name, email),
        approved_by_profile:profiles!approved_by(id, name, email),
        return_items(
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          condition,
          product:products(id, name, sku)
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`return_number.ilike.%${search}%,reason.ilike.%${search}%`)
    }

    if (store_id) {
      query = query.eq('store_id', store_id)
    }

    if (return_type) {
      query = query.eq('return_type', return_type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (start_date) {
      query = query.gte('return_date', start_date)
    }

    if (end_date) {
      query = query.lte('return_date', end_date)
    }

    const { data: returns, count, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: ApiResponse<ReturnsResponse> = {
      data: {
        returns: returns || [],
        totalCount: count || 0,
        totalPages,
        currentPage: page
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching returns:', error)
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
      sale_id,
      store_id,
      return_date = new Date().toISOString().split('T')[0],
      return_type = 'CUSTOMER',
      refund_method = 'CASH',
      reason,
      status = 'PENDING',
      items
    } = body

    if (!store_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: store_id, items' },
        { status: 400 }
      )
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price || !item.condition) {
        return NextResponse.json(
          { error: 'Each item must have product_id, quantity, unit_price, and condition' },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const total_amount = items.reduce((sum: number, item: ReturnItem) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)

    // For now, refund amount equals total amount (can be adjusted based on business rules)
    const refund_amount = total_amount

    // Generate return number
    const returnNumber = `RTN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create return
    const { data: returnRecord, error: returnError } = await supabase
      .from('returns')
      .insert([{
        return_number: returnNumber,
        sale_id,
        store_id,
        return_date,
        return_type,
        total_amount,
        refund_amount,
        refund_method,
        reason,
        status,
        created_by: user.id
      }])
      .select()
      .single()

    if (returnError) {
      return NextResponse.json(
        { error: returnError.message },
        { status: 500 }
      )
    }

    // Insert return items
    const returnItems = items.map((item: ReturnItem) => ({
      return_id: returnRecord.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      condition: item.condition
    }))

    const { error: itemsError } = await supabase
      .from('return_items')
      .insert(returnItems)

    if (itemsError) {
      // Rollback return if items insertion fails
      await supabase.from('returns').delete().eq('id', returnRecord.id)
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      )
    }

    // If status is approved, update stock and create movements
    if (status === 'APPROVED' || status === 'COMPLETED') {
      for (const item of items) {
        // Only add back to stock if condition is GOOD
        if (item.condition === 'GOOD') {
          // Update stock
          const { error: stockError } = await supabase.rpc('update_stock_quantity', {
            p_product_id: item.product_id,
            p_store_id: store_id,
            p_quantity_change: item.quantity
          })

          if (stockError) {
            console.error('Error updating stock:', stockError)
          }
        }

        // Create stock movement
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert([{
            product_id: item.product_id,
            store_id: store_id,
            movement_type: item.condition === 'GOOD' ? 'IN' : 'OUT',
            quantity: item.quantity,
            reference_type: 'RETURN',
            reference_id: returnRecord.id,
            notes: `Return - ${item.condition}`,
            created_by: user.id
          }])

        if (movementError) {
          console.error('Error creating stock movement:', movementError)
        }
      }
    }

    // Fetch the complete return with relations
    const { data: completeReturn, error: fetchError } = await supabase
      .from('returns')
      .select(`
        *,
        store:stores(id, name, location),
        sale:sales(id, invoice_number, customer_name),
        created_by_profile:profiles!created_by(id, name, email),
        approved_by_profile:profiles!approved_by(id, name, email),
        return_items(
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          condition,
          product:products(id, name, sku)
        )
      `)
      .eq('id', returnRecord.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Return> = {
      data: completeReturn,
      message: 'Return created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating return:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}