'use client'

import React from 'react'
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  BarChart3,
  XCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAnalytics } from './analytics/hooks/use-analytics'
import { useProducts } from './inventory/hooks/use-products'
import { useStores } from './inventory/hooks/use-stores'
import Link from 'next/link'

// Mock data for demonstration
const categoryData = [
  { name: 'Electronics', count: 45, percentage: 35 },
  { name: 'Clothing', count: 32, percentage: 25 },
  { name: 'Home & Garden', count: 25, percentage: 20 },
  { name: 'Books', count: 15, percentage: 12 },
  { name: 'Sports', count: 10, percentage: 8 }
]

const recentActivity = [
  {
    id: 1,
    message: 'Low stock alert for iPhone 15 Pro',
    user: 'System',
    timestamp: '2 minutes ago',
    icon: AlertTriangle,
    color: 'text-yellow-600'
  },
  {
    id: 2,
    message: 'New sale recorded: $1,250.00',
    user: 'John Doe',
    timestamp: '15 minutes ago',
    icon: ShoppingCart,
    color: 'text-green-600'
  },
  {
    id: 3,
    message: 'Stock adjustment completed',
    user: 'Jane Smith',
    timestamp: '1 hour ago',
    icon: Package,
    color: 'text-blue-600'
  },
  {
    id: 4,
    message: 'Return processed: Order #12345',
    user: 'Mike Johnson',
    timestamp: '2 hours ago',
    icon: ArrowDownRight,
    color: 'text-orange-600'
  }
]

export default function Dashboard() {
  const { analytics, loading: analyticsLoading, refreshAnalytics } = useAnalytics()
  const { products, loading: productsLoading } = useProducts()
  useStores() // Load stores data for potential future use

  // Calculate metrics from real data when available
  const totalProducts = analytics?.total_products || 0
  const lowStockItems = analytics?.low_stock_products || 0  
  const outOfStockItems = analytics?.out_of_stock_products || 0
  const totalValue = analytics?.total_stock_value || 0
  const totalSales = analytics?.total_sales_this_month || 0
  const averageStockLevel = products.length > 0 ? 
    Math.round(products.reduce((sum, product) => {
      const totalQuantity = product.stock?.reduce((stockSum, stock) => stockSum + stock.quantity, 0) || 0
      return sum + totalQuantity
    }, 0) / products.length) : 0

  const criticalItems = products.filter(product => {
    const totalQuantity = product.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
    return totalQuantity === 0 || totalQuantity <= product.min_stock_level * 0.5
  }).slice(0, 5)

  const topSellingItems = analytics?.top_selling_products?.slice(0, 5) || []

  const isLoading = analyticsLoading || productsLoading


  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory performance and key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/app/inventory">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Active products
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Inventory at cost
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                <BarChart3 className="w-3 h-3 mr-1" />
                This month&apos;s revenue
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Stock Level</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageStockLevel}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Units per product
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/app/inventory?filter=out_of_stock">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 hover:bg-red-100 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                Critical Alerts
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-red-600">Items out of stock</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/inventory?filter=low_stock">
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20 hover:bg-yellow-100 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Low Stock Warnings
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <p className="text-xs text-yellow-600">Items need restocking</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Healthy Stock
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(0, totalProducts - lowStockItems - outOfStockItems)}
            </div>
            <p className="text-xs text-green-600">Items well stocked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-muted-foreground">{category.count} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={category.percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                    <activity.icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {activity.user}</span>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Critical Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Items
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalItems.map((item) => {
                const totalQuantity = item.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={totalQuantity === 0 ? "destructive" : "secondary"}>
                        {totalQuantity === 0 ? "Out of Stock" : `${totalQuantity} left`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {criticalItems.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p>No critical items at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Selling Items
            </CardTitle>
            <CardDescription>Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellingItems.map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{item.quantity_sold} sold</p>
                    <p className="text-xs text-muted-foreground">${item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {topSellingItems.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p>No sales data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common inventory management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/app/inventory">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Plus className="w-6 h-6" />
                Add Product
              </Button>
            </Link>
            <Link href="/app/inventory/adjustments">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Package className="w-6 h-6" />
                Adjust Stock
              </Button>
            </Link>
            <Link href="/app/analytics">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Eye className="w-6 h-6" />
                View Reports
              </Button>
            </Link>
            <Link href="/app/stores">
              <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                <Bell className="w-6 h-6" />
                Manage Stores
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}