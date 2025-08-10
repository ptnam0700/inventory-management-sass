'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, AlertTriangle, Search, MoreHorizontal, CheckCircle, XCircle, Edit, Trash2, Eye, Filter, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProductWithRelations } from '@/lib/types'
import { ProductDialog } from './components/product-dialog'
import { StockAdjustmentDialog } from './components/stock-adjustment-dialog'
import { useProducts } from './hooks/use-products'
import { useStores } from './hooks/use-stores'
import Link from 'next/link'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [showLowStock, setShowLowStock] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null)

  const { products, loading, error, fetchProducts } = useProducts()
  const { stores } = useStores()

  useEffect(() => {
    fetchProducts({
      search,
      store_id: selectedStore === 'all' ? undefined : selectedStore,
      low_stock: showLowStock
    })
  }, [search, selectedStore, showLowStock, fetchProducts])

  const handleEditProduct = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setProductDialogOpen(true)
  }

  const handleStockAdjustment = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setStockDialogOpen(true)
  }

  const getStockStatus = (product: ProductWithRelations) => {
    const totalQuantity = product.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
    
    if (totalQuantity === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </Badge>
      )
    } else if (totalQuantity <= product.min_stock_level * 0.5) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Critical
        </Badge>
      )
    } else if (totalQuantity <= product.min_stock_level) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Low Stock
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3" />
          In Stock
        </Badge>
      )
    }
  }

  const getStockColor = (stock: number, minStock: number) => {
    if (stock === 0) return "text-red-600 font-semibold"
    if (stock <= minStock * 0.5) return "text-red-600 font-semibold"
    if (stock <= minStock) return "text-yellow-600 font-semibold"
    return "text-green-600 font-semibold"
  }

  const getStockValue = (product: ProductWithRelations) => {
    const totalQuantity = product.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
    return totalQuantity * product.cost_price
  }

  const totalProducts = products.length
  const totalStockValue = products.reduce((sum, product) => sum + getStockValue(product), 0)
  const lowStockProducts = products.filter(product => {
    const totalQuantity = product.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
    return totalQuantity <= product.min_stock_level && totalQuantity > 0
  }).length
  const outOfStockProducts = products.filter(product => {
    const totalQuantity = product.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
    return totalQuantity === 0
  }).length

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/inventory/adjustments">
            <Button variant="outline" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              View Adjustments
            </Button>
          </Link>
          <Button className="flex items-center gap-2" onClick={() => setProductDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalStockValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>A list of all products in your inventory</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-8 w-[300px]" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Store filter and Low Stock toggle */}
          <div className="flex gap-4 mt-4">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              Low Stock Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              Error loading products: {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const totalQuantity = product.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>{product.category?.name || 'No category'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={getStockColor(totalQuantity, product.min_stock_level)}>
                              {totalQuantity} {product.unit_of_measure}
                            </span>
                            <span className="text-xs text-muted-foreground">Min: {product.min_stock_level}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStockStatus(product)}</TableCell>
                        <TableCell className="font-medium">${product.selling_price}</TableCell>
                        <TableCell className="text-muted-foreground">${product.cost_price}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(product.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleStockAdjustment(product)}
                              >
                                <Package className="w-4 h-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {products.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found. Add your first product to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts()
          setSelectedProduct(null)
        }}
      />

      <StockAdjustmentDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts()
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}