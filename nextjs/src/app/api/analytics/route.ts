// @ts-nocheck - This file uses inventory tables not in the generated Supabase types
import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase/server'
import { ApiResponse, InventoryAnalytics } from '@/lib/types'

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
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    // Get total products count
    // @ts-ignore - Supabase types may not include all inventory tables
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get inventory value and stock levels
    const { data: stockData } = await supabase
      .from('stock')
      .select(`
        quantity,
        products!inner(cost_price, min_stock_level, is_active)
      `)
      .eq('products.is_active', true)

    let totalStockValue = 0
    let lowStockProducts = 0
    let outOfStockProducts = 0

    if (stockData) {
      const productStockSummary: { [productId: string]: { totalQuantity: number, minStock: number, costPrice: number } } = {}
      
      stockData.forEach(stock => {
        const product = stock.products
        if (product) {
          const key = `${product.cost_price}-${product.min_stock_level}`
          if (!productStockSummary[key]) {
            productStockSummary[key] = {
              totalQuantity: 0,
              minStock: product.min_stock_level,
              costPrice: product.cost_price
            }
          }
          productStockSummary[key].totalQuantity += stock.quantity
        }
      })

      Object.values(productStockSummary).forEach(summary => {
        totalStockValue += summary.totalQuantity * summary.costPrice
        
        if (summary.totalQuantity === 0) {
          outOfStockProducts++
        } else if (summary.totalQuantity <= summary.minStock) {
          lowStockProducts++
        }
      })
    }

    // Get today's sales
    const { data: todaySales } = await supabase
      .from('sales')
      .select('total_amount')
      .gte('created_at', todayStart.toISOString())
      .eq('payment_status', 'PAID')

    const totalSalesToday = todaySales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0

    // Get this month's sales
    const { data: monthSales } = await supabase
      .from('sales')
      .select('total_amount')
      .gte('created_at', monthStart.toISOString())
      .eq('payment_status', 'PAID')

    const totalSalesThisMonth = monthSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0

    // Get this month's purchases (using cost_price from sale_items)
    const { data: monthPurchases } = await supabase
      .from('sales')
      .select(`
        sale_items!inner(
          quantity,
          products!inner(cost_price)
        )
      `)
      .gte('created_at', monthStart.toISOString())
      .eq('payment_status', 'PAID')

    let totalPurchasesThisMonth = 0
    if (monthPurchases) {
      monthPurchases.forEach((sale: {
        sale_items: Array<{
          quantity: number
          products: { cost_price: number } | null
        }>
      }) => {
        sale.sale_items.forEach((item) => {
          if (item.products) {
            totalPurchasesThisMonth += item.quantity * item.products.cost_price
          }
        })
      })
    }

    const profitThisMonth = totalSalesThisMonth - totalPurchasesThisMonth

    // Get top selling products (last 30 days)
    const { data: topSellingData } = await supabase
      .from('sale_items')
      .select(`
        quantity,
        total_price,
        products!inner(id, name, sku),
        sales!inner(created_at, payment_status)
      `)
      .gte('sales.created_at', startDate.toISOString())
      .eq('sales.payment_status', 'PAID')

    const productSales: { [productId: string]: { 
      product: { id: string, name: string, sku: string }, 
      quantity_sold: number, 
      revenue: number 
    } } = {}
    
    if (topSellingData) {
      topSellingData.forEach((item: {
        quantity: number
        total_price: number | null
        products: { id: string, name: string, sku: string } | null
        sales: { created_at: string, payment_status: string } | null
      }) => {
        if (item.products && item.sales) {
          const productId = item.products.id
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.products,
              quantity_sold: 0,
              revenue: 0
            }
          }
          productSales[productId].quantity_sold += item.quantity
          productSales[productId].revenue += item.total_price || 0
        }
      })
    }

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 5)

    // Get stock movements summary (last 7 days)
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    
    const { data: stockMovements } = await supabase
      .from('stock_movements')
      .select('movement_type, quantity, created_at')
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: true })

    const movementsSummary: { [date: string]: { in_movements: number, out_movements: number } } = {}
    
    if (stockMovements) {
      stockMovements.forEach(movement => {
        const date = new Date(movement.created_at).toISOString().split('T')[0]
        if (!movementsSummary[date]) {
          movementsSummary[date] = { in_movements: 0, out_movements: 0 }
        }
        
        if (movement.movement_type === 'IN') {
          movementsSummary[date].in_movements += movement.quantity
        } else if (movement.movement_type === 'OUT') {
          movementsSummary[date].out_movements += movement.quantity
        }
      })
    }

    const stockMovementsSummary = Object.entries(movementsSummary).map(([date, data]) => ({
      date,
      ...data
    }))

    const analytics: InventoryAnalytics = {
      total_products: totalProducts || 0,
      total_stock_value: Math.round(totalStockValue * 100) / 100,
      low_stock_products: lowStockProducts,
      out_of_stock_products: outOfStockProducts,
      total_sales_today: Math.round(totalSalesToday * 100) / 100,
      total_sales_this_month: Math.round(totalSalesThisMonth * 100) / 100,
      total_purchases_this_month: Math.round(totalPurchasesThisMonth * 100) / 100,
      profit_this_month: Math.round(profitThisMonth * 100) / 100,
      top_selling_products: topSellingProducts,
      stock_movements_summary: stockMovementsSummary
    }

    const response: ApiResponse<InventoryAnalytics> = {
      data: analytics
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}