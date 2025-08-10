'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  RefreshCw,
  Calendar,
  Store,
  ShoppingCart,
  XCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAnalytics } from './hooks/use-analytics'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const { analytics, loading, error, fetchAnalytics, refreshAnalytics } = useAnalytics({
    days: parseInt(selectedPeriod)
  })

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    fetchAnalytics(parseInt(period))
  }

  if (loading && !analytics) {
    return (
      <div className="w-full space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-muted-foreground">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-2">Error loading analytics</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <Button onClick={refreshAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Overview of your inventory and sales performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_products.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Active products in inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.total_stock_value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total stock value at cost
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${analytics.total_sales_today.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue from today&apos;s sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.profit_this_month >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${analytics.profit_this_month.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Profit this month (sales - cost)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${analytics.total_sales_this_month.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue this month
                </p>
              </CardContent>
            </Card>

            <Link href="/app/inventory" className="block">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics.low_stock_products.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Products below minimum level
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app/inventory" className="block">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.out_of_stock_products.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Products with zero stock
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Top Selling Products */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>
                  Best performers in the last {selectedPeriod} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.top_selling_products.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.top_selling_products.map((item, index) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-muted-foreground">SKU: {item.product.sku}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity_sold.toLocaleString()} sold</div>
                          <div className="text-sm text-muted-foreground">
                            ${item.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No sales data available for this period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Movement Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Recent Stock Movements
                </CardTitle>
                <CardDescription>
                  Stock in/out activity for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.stock_movements_summary.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.stock_movements_summary.slice(0, 7).map((movement) => (
                      <div key={movement.date} className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {new Date(movement.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">+{movement.in_movements.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">-{movement.out_movements.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No stock movement data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Navigate to key areas based on your analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-4">
                <Link href="/app/inventory">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                </Link>
                <Link href="/app/sales">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Sales
                  </Button>
                </Link>
                <Link href="/app/stores">
                  <Button variant="outline" className="w-full justify-start">
                    <Store className="w-4 h-4 mr-2" />
                    Manage Stores
                  </Button>
                </Link>
                <Link href="/app/inventory/adjustments">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Stock Adjustments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}