// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, Product, ProductsResponse } from '@/lib/types'
import { createSSRClient } from '@/lib/supabase/server'

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
    const category_id = searchParams.get('category_id')
    const is_active = searchParams.get('is_active')
    const low_stock = searchParams.get('low_stock')
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
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
          store:stores(id, name)
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true')
    }

    if (low_stock === 'true') {
      // This will need to be handled with a view or computed field
      // For now, we'll filter in the application layer
    }

    const { data: products, count, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: ApiResponse<ProductsResponse> = {
      data: {
        products: products || [],
        totalCount: count || 0,
        totalPages,
        currentPage: page
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching products:', error)
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
      description,
      sku,
      barcode,
      category_id,
      unit_of_measure = 'pcs',
      cost_price,
      selling_price,
      min_stock_level = 0,
      max_stock_level,
      reorder_point = 0,
      is_active = true
    } = body

    if (!name || !sku || cost_price === undefined || selling_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, cost_price, selling_price' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
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
        is_active,
        created_by: user.id
      }])
      .select(`
        *,
        category:categories(*),
        profiles:created_by(id, name, email)
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
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
      message: 'Product created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}