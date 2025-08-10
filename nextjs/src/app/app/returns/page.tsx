'use client'

import { useState, useEffect } from 'react'
import { Plus, RotateCcw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ReturnWithRelations } from '@/lib/types'
import { ReturnDialog } from './components/return-dialog'
import { useReturns } from './hooks/use-returns'
import { useStores } from '../inventory/hooks/use-stores'
import { format } from 'date-fns'

export default function ReturnsPage() {
  const [search, setSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [returnType, setReturnType] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnWithRelations | null>(null)

  const { returns, loading, error, fetchReturns } = useReturns()
  const { stores } = useStores()

  useEffect(() => {
    fetchReturns({
      search,
      store_id: selectedStore === 'all' ? undefined : selectedStore,
      return_type: returnType === 'all' ? undefined : returnType,
      status: status === 'all' ? undefined : status,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    })
  }, [search, selectedStore, returnType, status, startDate, endDate, fetchReturns])

  const handleViewReturn = (returnRecord: ReturnWithRelations) => {
    setSelectedReturn(returnRecord)
    setReturnDialogOpen(true)
  }

  const handleNewReturn = () => {
    setSelectedReturn(null)
    setReturnDialogOpen(true)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'APPROVED':
        return 'secondary'
      case 'PENDING':
        return 'outline'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getReturnTypeVariant = (type: string) => {
    switch (type) {
      case 'CUSTOMER':
        return 'default'
      case 'SUPPLIER':
        return 'secondary'
      case 'DAMAGED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Calculate statistics
  const totalReturns = returns.length
  const totalRefundAmount = returns.reduce((sum, returnRecord) => sum + returnRecord.refund_amount, 0)
  const pendingReturns = returns.filter(r => r.status === 'PENDING').length
  const approvedReturns = returns.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Returns Management</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <Button onClick={handleNewReturn}>
          <Plus className="h-4 w-4 mr-2" />
          New Return
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReturns}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRefundAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReturns}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Returns</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedReturns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by return number or reason..."
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

        <Select value={returnType} onValueChange={setReturnType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Return type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="SUPPLIER">Supplier</SelectItem>
            <SelectItem value="DAMAGED">Damaged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
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

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
          <CardDescription>
            View and manage product returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading returns...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              Error loading returns: {error}
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((returnRecord) => {
                return (
                  <div key={returnRecord.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">{returnRecord.return_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {returnRecord.sale?.invoice_number && `Original Sale: ${returnRecord.sale.invoice_number}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {returnRecord.sale?.customer_name || 'Walk-in Customer'}
                          </p>
                          {returnRecord.reason && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Reason: {returnRecord.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">${returnRecord.refund_amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(returnRecord.return_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {returnRecord.store?.name || 'Unknown Store'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Badge variant={getStatusVariant(returnRecord.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(returnRecord.status)}
                            {returnRecord.status}
                          </div>
                        </Badge>
                        <Badge variant={getReturnTypeVariant(returnRecord.return_type)}>
                          {returnRecord.return_type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {returnRecord.refund_method}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReturn(returnRecord)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {returns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No returns found. Create your first return to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ReturnDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        returnRecord={selectedReturn}
        onSuccess={() => {
          fetchReturns()
          setSelectedReturn(null)
        }}
      />
    </div>
  )
}