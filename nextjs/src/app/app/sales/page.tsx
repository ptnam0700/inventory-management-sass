'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, Receipt, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sale } from '@/lib/types'
import { SaleDialog } from './components/sale-dialog'
import { useSales } from './hooks/use-sales'
import { useStores } from '../inventory/hooks/use-stores'
import { format } from 'date-fns'

export default function SalesPage() {
  const [search, setSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [paymentStatus, setPaymentStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const { sales, loading, error, fetchSales } = useSales()
  const { stores } = useStores()

  useEffect(() => {
    fetchSales({
      search,
      store_id: selectedStore === 'all' ? undefined : selectedStore,
      payment_status: paymentStatus === 'all' ? undefined : paymentStatus,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    })
  }, [search, selectedStore, paymentStatus, startDate, endDate, fetchSales])

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale)
    setSaleDialogOpen(true)
  }

  const handleNewSale = () => {
    setSelectedSale(null)
    setSaleDialogOpen(true)
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'PARTIAL':
        return 'outline'
      case 'REFUNDED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Calculate statistics
  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const todaysSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date)
    const today = new Date()
    return saleDate.toDateString() === today.toDateString()
  })
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const pendingSales = sales.filter(sale => sale.payment_status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">Track and manage your sales transactions</p>
        </div>
        <Button onClick={handleNewSale}>
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${todaysRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{todaysSales.length} sales today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by invoice number, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="w-full sm:w-48">
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

        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>
            View and manage all sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading sales...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              Error loading sales: {error}
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => {
                return (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">{sale.invoice_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {sale.customer_name || 'Walk-in Customer'}
                          </p>
                          {sale.customer_phone && (
                            <p className="text-sm text-muted-foreground">{sale.customer_phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">${sale.total_amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(sale.sale_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sale.store?.name || 'Unknown Store'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Badge variant={getPaymentStatusVariant(sale.payment_status)}>
                          {sale.payment_status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {sale.payment_method}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSale(sale)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {sales.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No sales found. Create your first sale to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SaleDialog
        open={saleDialogOpen}
        onOpenChange={setSaleDialogOpen}
        sale={selectedSale}
        onSuccess={() => {
          fetchSales()
          setSelectedSale(null)
        }}
      />
    </div>
  )
}