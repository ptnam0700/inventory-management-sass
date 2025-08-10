// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Product } from '@/lib/types'

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

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        profiles:created_by(id, name, email),
        stock(
          id,
          store_id,
          quantity,
          reserved_quantity,
          last_updated,
          store:stores(id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Product> = {
      data: product
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching product:', error)
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
      description,
      sku,
      barcode,
      category_id,
      unit_of_measure,
      cost_price,
      selling_price,
      min_stock_level,
      max_stock_level,
      reorder_point,
      is_active
    } = body

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        sku,
        barcode,
        category_id,
        unit_of_measure,
        cost_price,
        selling_price,
        min_stock_level,
        max_stock_level,
        reorder_point,
        is_active
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        profiles:created_by(id, name, email),
        stock(
          id,
          store_id,
          quantity,
          reserved_quantity,
          store:stores(id, name)
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Product> = {
      data: product,
      message: 'Product updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating product:', error)
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

    // Check if product has stock or transactions
    const { data: stock, error: stockError } = await supabase
      .from('stock')
      .select('quantity')
      .eq('product_id', id)
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
        { error: 'Cannot delete product with existing stock. Consider deactivating instead.' },
        { status: 400 }
      )
    }

    // Check for any transactions
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('id')
      .eq('product_id', id)
      .limit(1)

    if (movementsError) {
      return NextResponse.json(
        { error: movementsError.message },
        { status: 500 }
      )
    }

    if (movements && movements.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with transaction history. Consider deactivating instead.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const response: ApiResponse = {
      message: 'Product deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}