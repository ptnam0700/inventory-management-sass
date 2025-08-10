'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductWithRelations } from '@/lib/types'
import { useStores } from '../hooks/use-stores'

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductWithRelations | null
  onSuccess?: () => void
}

interface StockAdjustmentFormData {
  store_id: string
  adjustment_type: 'INCREASE' | 'DECREASE' | 'SET'
  quantity: number
  reason: string
  notes: string
}

export function StockAdjustmentDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess 
}: StockAdjustmentDialogProps) {
  const { stores } = useStores()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentStock, setCurrentStock] = useState<Record<string, number>>({})

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    defaultValues: {
      store_id: '',
      adjustment_type: 'INCREASE',
      quantity: 0,
      reason: 'PHYSICAL_COUNT',
      notes: '',
    },
  })

  // Register store_id for validation
  useEffect(() => {
    register('store_id', { required: 'Please select a store' })
  }, [register])

  const selectedStoreId = watch('store_id')
  const adjustmentType = watch('adjustment_type')
  const quantity = watch('quantity')

  useEffect(() => {
    if (product?.stock) {
      const stockByStore: Record<string, number> = {}
      product.stock.forEach(stock => {
        if (stock.store_id) {
          stockByStore[stock.store_id] = stock.quantity
        }
      })
      setCurrentStock(stockByStore)
    }
  }, [product])

  const getCurrentStockForStore = (storeId: string) => {
    return currentStock[storeId] || 0
  }

  const getNewStockLevel = () => {
    if (!selectedStoreId) return 0
    const current = getCurrentStockForStore(selectedStoreId)
    
    switch (adjustmentType) {
      case 'INCREASE':
        return current + quantity
      case 'DECREASE':
        return Math.max(0, current - quantity)
      case 'SET':
        return quantity
      default:
        return current
    }
  }

  const onSubmit = async (data: StockAdjustmentFormData) => {
    if (!product) {
      setSubmitError('No product selected')
      return
    }

    if (!data.store_id) {
      setSubmitError('Please select a store')
      return
    }

    setSubmitError(null)
    setLoading(true)

    try {
      const currentQty = getCurrentStockForStore(data.store_id)
      let newQuantity: number

      switch (data.adjustment_type) {
        case 'INCREASE':
          newQuantity = currentQty + data.quantity
          break
        case 'DECREASE':
          newQuantity = Math.max(0, currentQty - data.quantity)
          break
        case 'SET':
          newQuantity = data.quantity
          break
        default:
          newQuantity = currentQty
      }

      const adjustmentData = {
        product_id: product.id,
        store_id: data.store_id,
        old_quantity: currentQty,
        new_quantity: newQuantity,
        reason: data.reason,
        notes: data.notes,
      }

      console.log('Sending stock adjustment:', adjustmentData)

      const response = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustmentData),
      })

      const responseData = await response.json()
      console.log('Stock adjustment response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      // Show success message briefly before closing
      if (responseData.message) {
        console.log('Success:', responseData.message)
      }

      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Stock adjustment error:', error)
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSubmitError(null)
    reset()
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust stock levels for {product.name} (SKU: {product.sku})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="store_id">Store *</Label>
              <Select
                value={selectedStoreId}
                onValueChange={(value) => setValue('store_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.filter(store => store.is_active).map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} (Current: {getCurrentStockForStore(store.id)} {product.unit_of_measure})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.store_id && (
                <span className="text-sm text-red-600">Please select a store</span>
              )}
            </div>

            {selectedStoreId && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Current Stock: {getCurrentStockForStore(selectedStoreId)} {product.unit_of_measure}</div>
                  <div className="text-green-600">New Stock: {getNewStockLevel()} {product.unit_of_measure}</div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="adjustment_type">Adjustment Type *</Label>
              <Select
                value={adjustmentType}
                onValueChange={(value: 'INCREASE' | 'DECREASE' | 'SET') => setValue('adjustment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCREASE">Increase Stock</SelectItem>
                  <SelectItem value="DECREASE">Decrease Stock</SelectItem>
                  <SelectItem value="SET">Set Stock Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">
                {adjustmentType === 'SET' ? 'New Stock Level' : 'Quantity'} *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be positive' }
                })}
              />
              {errors.quantity && (
                <span className="text-sm text-red-600">{errors.quantity.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select
                value={watch('reason')}
                onValueChange={(value: string) => setValue('reason', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                  <SelectItem value="THEFT">Theft</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                rows={3}
                placeholder="Optional notes about this adjustment..."
              />
            </div>
          </div>

          {submitError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedStoreId}>
              {loading ? 'Processing...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}