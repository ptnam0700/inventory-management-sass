// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Return } from '@/lib/types'

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

    const { data: returnRecord, error } = await supabase
      .from('returns')
      .select(`
        *,
        store:stores(id, name, location),
        sale:sales(id, invoice_number, customer_name, customer_phone),
        created_by_profile:profiles!created_by(id, name, email),
        approved_by_profile:profiles!approved_by(id, name, email),
        return_items(
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          condition,
          product:products(id, name, sku, unit_of_measure)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Return not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Return> = {
      data: returnRecord
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching return:', error)
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
      status,
      refund_method,
      refund_amount,
      reason
    } = body

    // Get current return data
    const { data: currentReturn, error: fetchError } = await supabase
      .from('returns')
      .select(`
        *,
        return_items(
          product_id,
          quantity,
          condition
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Return not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (refund_method !== undefined) updateData.refund_method = refund_method
    if (refund_amount !== undefined) updateData.refund_amount = refund_amount
    if (reason !== undefined) updateData.reason = reason

    // Handle status changes
    if (status !== undefined && status !== currentReturn.status) {
      updateData.status = status
      
      // If approving the return, handle stock movements
      if (status === 'APPROVED' && currentReturn.status === 'PENDING') {
        updateData.approved_by = user.id
        
        // Update stock and create movements for each item
        if (currentReturn.return_items) {
          for (const item of currentReturn.return_items) {
            // Only add back to stock if condition is GOOD
            if (item.condition === 'GOOD') {
              const { error: stockError } = await supabase.rpc('update_stock_quantity', {
                p_product_id: item.product_id,
                p_store_id: currentReturn.store_id,
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
                store_id: currentReturn.store_id,
                movement_type: item.condition === 'GOOD' ? 'IN' : 'OUT',
                quantity: item.quantity,
                reference_type: 'RETURN',
                reference_id: currentReturn.id,
                notes: `Return approved - ${item.condition}`,
                created_by: user.id
              }])

            if (movementError) {
              console.error('Error creating stock movement:', movementError)
            }
          }
        }
      }
      
      // If rejecting the return, just update status
      if (status === 'REJECTED' && currentReturn.status === 'PENDING') {
        updateData.approved_by = user.id
      }
    }

    const { data: updatedReturn, error: updateError } = await supabase
      .from('returns')
      .update(updateData)
      .eq('id', id)
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
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Return> = {
      data: updatedReturn,
      message: 'Return updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating return:', error)
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

    // Get current return data to check if we need to reverse stock movements
    const { data: returnRecord, error: fetchError } = await supabase
      .from('returns')
      .select(`
        *,
        return_items(
          product_id,
          quantity,
          condition
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Return not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // Only allow deletion if return is pending or rejected
    if (returnRecord.status === 'APPROVED' || returnRecord.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete approved or completed returns' },
        { status: 400 }
      )
    }

    // Delete the return (cascade will delete return_items)
    const { error: deleteError } = await supabase
      .from('returns')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Return deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting return:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}