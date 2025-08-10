'use client'

import { useState, useEffect } from 'react'
import { Calendar, Package, TrendingUp, TrendingDown, RotateCcw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdjustments } from '../hooks/use-adjustments'
import { useStores } from '../hooks/use-stores'
import Link from 'next/link'

export default function InventoryAdjustmentsPage() {
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedReason, setSelectedReason] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const { adjustments, loading, error, totalCount, fetchAdjustments } = useAdjustments()
  const { stores } = useStores()

  useEffect(() => {
    fetchAdjustments({
      store_id: selectedStore === 'all' ? undefined : selectedStore,
      adjustment_type: selectedType === 'all' ? undefined : selectedType,
      reason: selectedReason === 'all' ? undefined : selectedReason,
      start_date: dateRange.start || undefined,
      end_date: dateRange.end || undefined,
    })
  }, [selectedStore, selectedType, selectedReason, dateRange, fetchAdjustments])

  const getAdjustmentTypeBadge = (type: string) => {
    switch (type) {
      case 'INCREASE':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <TrendingUp className="w-3 h-3 mr-1" />
            Increase
          </Badge>
        )
      case 'DECREASE':
        return (
          <Badge variant="destructive">
            <TrendingDown className="w-3 h-3 mr-1" />
            Decrease
          </Badge>
        )
      case 'RECOUNT':
        return (
          <Badge variant="secondary">
            <RotateCcw className="w-3 h-3 mr-1" />
            Recount
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'PHYSICAL_COUNT':
        return 'Physical Count'
      case 'DAMAGE':
        return 'Damage'
      case 'THEFT':
        return 'Theft'
      case 'EXPIRED':
        return 'Expired'
      case 'OTHER':
        return 'Other'
      default:
        return reason
    }
  }

  const calculateTotalValueImpact = () => {
    return adjustments.reduce((sum, adjustment) => sum + adjustment.total_value_impact, 0)
  }

  const getAdjustmentsByType = () => {
    const increases = adjustments.filter(adj => adj.adjustment_type === 'INCREASE').length
    const decreases = adjustments.filter(adj => adj.adjustment_type === 'DECREASE').length
    const recounts = adjustments.filter(adj => adj.adjustment_type === 'RECOUNT').length
    return { increases, decreases, recounts }
  }

  const stats = getAdjustmentsByType()
  const totalValueImpact = calculateTotalValueImpact()

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/app/inventory">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Inventory
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Inventory Adjustments</h1>
          <p className="text-muted-foreground">View all stock adjustments and their impact on inventory</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Increases</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.increases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Decreases</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.decreases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value Impact</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalValueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalValueImpact.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Adjustment History</CardTitle>
              <CardDescription>Complete history of all inventory adjustments</CardDescription>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-5 mt-4">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="All Stores" />
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INCREASE">Increase</SelectItem>
                <SelectItem value="DECREASE">Decrease</SelectItem>
                <SelectItem value="RECOUNT">Recount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="All Reasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
                <SelectItem value="DAMAGE">Damage</SelectItem>
                <SelectItem value="THEFT">Theft</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading adjustments...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              Error loading adjustments: {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value Impact</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="font-mono text-sm">
                        {adjustment.adjustment_number}
                      </TableCell>
                      <TableCell>
                        {new Date(adjustment.adjustment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {adjustment.store?.name || 'Unknown Store'}
                      </TableCell>
                      <TableCell>
                        {getAdjustmentTypeBadge(adjustment.adjustment_type)}
                      </TableCell>
                      <TableCell>
                        {getReasonLabel(adjustment.reason || 'OTHER')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {adjustment.stock_adjustment_items?.map((item) => (
                            <div key={item.id} className="text-sm">
                              <div className="font-medium">{item.product?.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {item.old_quantity} → {item.new_quantity} {item.product?.unit_of_measure}
                                <span className={`ml-1 ${item.quantity_difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({item.quantity_difference > 0 ? '+' : ''}{item.quantity_difference})
                                </span>
                              </div>
                            </div>
                          )) || <span className="text-muted-foreground">No items</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${adjustment.total_value_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${adjustment.total_value_impact.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {adjustment.created_by_profile?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground truncate" title={adjustment.notes || undefined}>
                          {adjustment.notes || '—'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {adjustments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No adjustments found. Stock adjustments will appear here when created.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}