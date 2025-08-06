import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, StockAdjustment } from '@/lib/types'

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
    const store_id = searchParams.get('store_id')
    const adjustment_type = searchParams.get('adjustment_type')
    const reason = searchParams.get('reason')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('stock_adjustments')
      .select(`
        *,
        store:stores(id, name, location),
        created_by_profile:profiles!created_by(id, name, email),
        approved_by_profile:profiles!approved_by(id, name, email),
        stock_adjustment_items(
          id,
          product_id,
          old_quantity,
          new_quantity,
          quantity_difference,
          unit_cost,
          value_impact,
          product:products(id, name, sku, unit_of_measure)
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (store_id) {
      query = query.eq('store_id', store_id)
    }

    if (adjustment_type) {
      query = query.eq('adjustment_type', adjustment_type)
    }

    if (reason) {
      query = query.eq('reason', reason)
    }

    if (start_date) {
      query = query.gte('adjustment_date', start_date)
    }

    if (end_date) {
      query = query.lte('adjustment_date', end_date)
    }

    const { data: adjustments, count, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: ApiResponse<{
      adjustments: StockAdjustment[]
      totalCount: number
      totalPages: number
      currentPage: number
    }> = {
      data: {
        adjustments: adjustments || [],
        totalCount: count || 0,
        totalPages,
        currentPage: page
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching stock adjustments:', error)
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
      product_id,
      store_id,
      old_quantity,
      new_quantity,
      reason,
      notes
    } = body

    if (!product_id || !store_id || old_quantity === undefined || new_quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate adjustment number
    const adjustmentNumber = `ADJ-${Date.now()}`
    
    // Determine adjustment type
    let adjustmentType: 'INCREASE' | 'DECREASE' | 'RECOUNT'
    if (new_quantity > old_quantity) {
      adjustmentType = 'INCREASE'
    } else if (new_quantity < old_quantity) {
      adjustmentType = 'DECREASE'
    } else {
      adjustmentType = 'RECOUNT'
    }

    // Get product cost for value calculation
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('cost_price')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const quantityDifference = new_quantity - old_quantity
    const valueImpact = quantityDifference * product.cost_price

    // Create stock adjustment
    const { data: adjustment, error: adjustmentError } = await supabase
      .from('stock_adjustments')
      .insert([{
        adjustment_number: adjustmentNumber,
        store_id,
        adjustment_type: adjustmentType,
        reason,
        notes,
        total_value_impact: valueImpact,
        created_by: user.id,
        approved_by: user.id // Auto-approve for now
      }])
      .select('id')
      .single()

    if (adjustmentError) {
      return NextResponse.json(
        { error: adjustmentError.message },
        { status: 500 }
      )
    }

    // Create stock adjustment item
    const { error: itemError } = await supabase
      .from('stock_adjustment_items')
      .insert([{
        adjustment_id: adjustment.id,
        product_id,
        old_quantity,
        new_quantity,
        unit_cost: product.cost_price
      }])

    if (itemError) {
      return NextResponse.json(
        { error: itemError.message },
        { status: 500 }
      )
    }

    // Update the actual stock table first
    const { error: stockUpdateError } = await supabase
      .from('stock')
      .upsert([{
        product_id,
        store_id,
        quantity: new_quantity,
        last_updated: new Date().toISOString(),
        updated_by: user.id
      }], { 
        onConflict: 'product_id,store_id',
        ignoreDuplicates: false 
      })

    if (stockUpdateError) {
      console.error('Stock update error:', stockUpdateError)
      return NextResponse.json(
        { error: 'Failed to update stock levels' },
        { status: 500 }
      )
    }

    // Create stock movement for audit trail
    if (quantityDifference !== 0) {
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          product_id,
          store_id,
          movement_type: quantityDifference > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDifference),
          reference_type: 'ADJUSTMENT',
          reference_id: adjustment.id,
          notes: `Stock adjustment: ${reason}`,
          created_by: user.id
        }])

      if (movementError) {
        console.error('Stock movement error:', movementError)
        // Don't fail the entire operation for movement logging
      }
    }

    const response: ApiResponse<{ id: string }> = {
      data: { id: adjustment.id },
      message: 'Stock adjustment created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating stock adjustment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}