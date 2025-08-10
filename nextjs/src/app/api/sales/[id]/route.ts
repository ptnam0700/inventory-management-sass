// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Sale } from '@/lib/types'

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

    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        store:stores(id, name, location),
        profiles:created_by(id, name, email),
        sale_items(
          id,
          product_id,
          quantity,
          unit_price,
          discount_amount,
          total_price,
          product:products(id, name, sku, unit_of_measure)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Sale> = {
      data: sale
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching sale:', error)
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
      customer_name,
      customer_phone,
      customer_email,
      payment_method,
      payment_status,
      notes
    } = body

    // Only allow updating certain fields after creation
    const updateData: Record<string, unknown> = {}
    if (customer_name !== undefined) updateData.customer_name = customer_name
    if (customer_phone !== undefined) updateData.customer_phone = customer_phone
    if (customer_email !== undefined) updateData.customer_email = customer_email
    if (payment_method !== undefined) updateData.payment_method = payment_method
    if (payment_status !== undefined) updateData.payment_status = payment_status
    if (notes !== undefined) updateData.notes = notes

    updateData.updated_at = new Date().toISOString()

    const { data: sale, error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        store:stores(id, name, location),
        profiles:created_by(id, name, email),
        sale_items(
          id,
          product_id,
          quantity,
          unit_price,
          discount_amount,
          total_price,
          product:products(id, name, sku)
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Sale> = {
      data: sale,
      message: 'Sale updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating sale:', error)
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

    // First, get the sale details to reverse stock movements
    const { data: sale, error: fetchError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items(
          product_id,
          quantity
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // Only allow deletion if sale is not referenced by returns
    const { data: returns, error: returnsError } = await supabase
      .from('returns')
      .select('id')
      .eq('sale_id', id)
      .limit(1)

    if (returnsError) {
      return NextResponse.json(
        { error: returnsError.message },
        { status: 500 }
      )
    }

    if (returns && returns.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete sale with associated returns' },
        { status: 400 }
      )
    }

    // Reverse stock movements
    if (sale.sale_items) {
      for (const item of sale.sale_items) {
        // Add back to stock
        const { error: stockError } = await supabase.rpc('update_stock_quantity', {
          p_product_id: item.product_id,
          p_store_id: sale.store_id,
          p_quantity_change: item.quantity
        })

        if (stockError) {
          console.error('Error reversing stock:', stockError)
        }

        // Create reverse stock movement
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert([{
            product_id: item.product_id,
            store_id: sale.store_id,
            movement_type: 'IN',
            quantity: item.quantity,
            reference_type: 'SALE',
            reference_id: sale.id,
            notes: 'Sale deletion reversal',
            created_by: user.id
          }])

        if (movementError) {
          console.error('Error creating reverse stock movement:', movementError)
        }
      }
    }

    // Delete the sale (cascade will delete sale_items)
    const { error: deleteError } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Sale deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}