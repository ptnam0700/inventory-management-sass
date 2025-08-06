"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MoreHorizontal, Package, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Eye, Plus, Filter } from 'lucide-react'
import { StockAdjustmentModal } from "./stock-adjustment-modal"
import { useState } from "react"

const inventoryData = [
  {
    id: "INV001",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "Electronics",
    stock: 45,
    minStock: 10,
    price: 79.99,
    cost: 45.0,
    status: "In Stock",
    supplier: "TechCorp",
    lastUpdated: "2024-01-15",
  },
  {
    id: "INV002",
    name: "Ergonomic Office Chair",
    sku: "EOC-002",
    category: "Furniture",
    stock: 8,
    minStock: 5,
    price: 299.99,
    cost: 180.0,
    status: "Low Stock",
    supplier: "FurniMax",
    lastUpdated: "2024-01-14",
  },
  {
    id: "INV003",
    name: "Stainless Steel Water Bottle",
    sku: "SSWB-003",
    category: "Accessories",
    stock: 0,
    minStock: 20,
    price: 24.99,
    cost: 12.0,
    status: "Out of Stock",
    supplier: "EcoGoods",
    lastUpdated: "2024-01-13",
  },
  {
    id: "INV004",
    name: "Mechanical Gaming Keyboard",
    sku: "MGK-004",
    category: "Electronics",
    stock: 23,
    minStock: 15,
    price: 149.99,
    cost: 89.0,
    status: "In Stock",
    supplier: "GameTech",
    lastUpdated: "2024-01-15",
  },
  {
    id: "INV005",
    name: "Organic Cotton T-Shirt",
    sku: "OCT-005",
    category: "Clothing",
    stock: 3,
    minStock: 25,
    price: 29.99,
    cost: 15.0,
    status: "Critical",
    supplier: "EcoWear",
    lastUpdated: "2024-01-12",
  },
  {
    id: "INV006",
    name: "Smart Fitness Tracker",
    sku: "SFT-006",
    category: "Electronics",
    stock: 67,
    minStock: 20,
    price: 199.99,
    cost: 120.0,
    status: "In Stock",
    supplier: "FitTech",
    lastUpdated: "2024-01-15",
  },
  {
    id: "INV007",
    name: "Ceramic Coffee Mug Set",
    sku: "CCMS-007",
    category: "Home & Kitchen",
    stock: 15,
    minStock: 10,
    price: 39.99,
    cost: 18.0,
    status: "In Stock",
    supplier: "HomeGoods",
    lastUpdated: "2024-01-14",
  },
  {
    id: "INV008",
    name: "LED Desk Lamp",
    sku: "LDL-008",
    category: "Electronics",
    stock: 2,
    minStock: 8,
    price: 89.99,
    cost: 45.0,
    status: "Critical",
    supplier: "LightCorp",
    lastUpdated: "2024-01-11",
  },
]

export default function Component() {
  const [selectedItem, setSelectedItem] = useState<typeof inventoryData[0] | null>(null)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [inventory, setInventory] = useState(inventoryData)

  function getStatusBadge(status: string, stock: number, minStock: number) {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </Badge>
      )
    } else if (stock <= minStock * 0.5) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Critical
        </Badge>
      )
    } else if (stock <= minStock) {
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

  function getStockColor(stock: number, minStock: number) {
    if (stock === 0) return "text-red-600 font-semibold"
    if (stock <= minStock * 0.5) return "text-red-600 font-semibold"
    if (stock <= minStock) return "text-yellow-600 font-semibold"
    return "text-green-600 font-semibold"
  }

  const handleAdjustStock = (itemId: string, newStock: number, adjustmentType: string, reason: string, notes: string) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, stock: newStock, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ))
    
    // Here you would typically make an API call to update the backend
    console.log('Stock adjusted:', { itemId, newStock, adjustmentType, reason, notes })
  }

  const openStockModal = (item: typeof inventoryData[0]) => {
    setSelectedItem(item)
    setIsStockModalOpen(true)
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory and stock levels</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventoryData.filter((item) => item.stock <= item.minStock && item.stock > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryData.filter((item) => item.stock === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${inventoryData.reduce((sum, item) => sum + item.stock * item.cost, 0).toLocaleString()}
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
                <Input placeholder="Search products..." className="pl-8 w-[300px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={getStockColor(item.stock, item.minStock)}>{item.stock} units</span>
                        <span className="text-xs text-muted-foreground">Min: {item.minStock}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, item.stock, item.minStock)}</TableCell>
                    <TableCell className="font-medium">${item.price}</TableCell>
                    <TableCell className="text-muted-foreground">${item.cost}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
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
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2"
                            onClick={() => openStockModal(item)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        item={selectedItem}
        onAdjustStock={handleAdjustStock}
      />
    </div>
  )
}
