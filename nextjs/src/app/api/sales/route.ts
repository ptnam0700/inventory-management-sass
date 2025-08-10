// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, Sale, SalesResponse } from '@/lib/types'

interface SaleItem {
  product_id: string
  quantity: number
  unit_price: number
  discount_amount?: number
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
    const payment_status = searchParams.get('payment_status')
    const payment_method = searchParams.get('payment_method')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
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
          product:products(id, name, sku)
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)
    }

    if (store_id) {
      query = query.eq('store_id', store_id)
    }

    if (payment_status) {
      query = query.eq('payment_status', payment_status)
    }

    if (payment_method) {
      query = query.eq('payment_method', payment_method)
    }

    if (start_date) {
      query = query.gte('sale_date', start_date)
    }

    if (end_date) {
      query = query.lte('sale_date', end_date)
    }

    const { data: sales, count, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: ApiResponse<SalesResponse> = {
      data: {
        sales: sales || [],
        totalCount: count || 0,
        totalPages,
        currentPage: page
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching sales:', error)
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
      store_id,
      customer_name,
      customer_phone,
      customer_email,
      sale_date = new Date().toISOString().split('T')[0],
      payment_method = 'CASH',
      payment_status = 'PAID',
      discount_amount = 0,
      tax_amount = 0,
      notes,
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
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: 'Each item must have product_id, quantity, and unit_price' },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: SaleItem) => {
      const itemTotal = (item.quantity * item.unit_price) - (item.discount_amount || 0)
      return sum + itemTotal
    }, 0)

    const total_amount = subtotal + tax_amount - discount_amount

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Start transaction
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        invoice_number: invoiceNumber,
        store_id,
        customer_name,
        customer_phone,
        customer_email,
        sale_date,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        payment_method,
        payment_status,
        notes,
        created_by: user.id
      }])
      .select()
      .single()

    if (saleError) {
      return NextResponse.json(
        { error: saleError.message },
        { status: 500 }
      )
    }

    // Insert sale items
    const saleItems = items.map((item: SaleItem) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || 0
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      // Rollback sale if items insertion fails
      await supabase.from('sales').delete().eq('id', sale.id)
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      )
    }

    // Update stock quantities and create stock movements
    for (const item of items) {
      // Update stock
      const { error: stockError } = await supabase.rpc('update_stock_quantity', {
        p_product_id: item.product_id,
        p_store_id: store_id,
        p_quantity_change: -item.quantity
      })

      if (stockError) {
        console.error('Error updating stock:', stockError)
      }

      // Create stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: item.product_id,
          store_id: store_id,
          movement_type: 'OUT',
          quantity: item.quantity,
          reference_type: 'SALE',
          reference_id: sale.id,
          created_by: user.id
        }])

      if (movementError) {
        console.error('Error creating stock movement:', movementError)
      }
    }

    // Fetch the complete sale with relations
    const { data: completeSale, error: fetchError } = await supabase
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
          product:products(id, name, sku)
        )
      `)
      .eq('id', sale.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    const response: ApiResponse<Sale> = {
      data: completeSale,
      message: 'Sale created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}