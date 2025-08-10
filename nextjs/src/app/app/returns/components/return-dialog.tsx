'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, CheckCircle, XCircle } from 'lucide-react'
import { ReturnWithRelations } from '@/lib/types'
import { useReturns } from '../hooks/use-returns'
import { useProducts } from '../../inventory/hooks/use-products'
import { useStores } from '../../inventory/hooks/use-stores'

interface ReturnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnRecord?: ReturnWithRelations | null
  onSuccess?: () => void
}

interface ReturnItemFormData {
  product_id: string
  quantity: number
  unit_price: number
  condition: string
}

interface ReturnFormData {
  sale_id: string
  store_id: string
  return_date: string
  return_type: string
  refund_method: string
  reason: string
  status: string
  items: ReturnItemFormData[]
}

export function ReturnDialog({ open, onOpenChange, returnRecord, onSuccess }: ReturnDialogProps) {
  const { createReturn, updateReturn, approveReturn, rejectReturn, loading } = useReturns()
  const { products, fetchProducts } = useProducts()
  const { stores } = useStores()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ReturnFormData>({
    defaultValues: {
      sale_id: '',
      store_id: '',
      return_date: new Date().toISOString().split('T')[0],
      return_type: 'CUSTOMER',
      refund_method: 'CASH',
      reason: '',
      status: 'PENDING',
      items: [{ product_id: '', quantity: 1, unit_price: 0, condition: 'GOOD' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (returnRecord) {
      reset({
        sale_id: returnRecord.sale_id || '',
        store_id: returnRecord.store_id || '',
        return_date: returnRecord.return_date,
        return_type: returnRecord.return_type,
        refund_method: returnRecord.refund_method || 'CASH',
        reason: returnRecord.reason || '',
        status: returnRecord.status,
        items: returnRecord.return_items?.map(item => ({
          product_id: item.product_id || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          condition: item.condition,
        })) || [],
      })
    } else {
      reset({
        sale_id: '',
        store_id: '',
        return_date: new Date().toISOString().split('T')[0],
        return_type: 'CUSTOMER',
        refund_method: 'CASH',
        reason: '',
        status: 'PENDING',
        items: [{ product_id: '', quantity: 1, unit_price: 0, condition: 'GOOD' }],
      })
    }
  }, [returnRecord, reset])

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setValue(`items.${index}.product_id`, productId)
      setValue(`items.${index}.unit_price`, product.selling_price)
    }
  }

  const calculateTotalAmount = () => {
    return watchedItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)
  }

  const addItem = () => {
    append({ product_id: '', quantity: 1, unit_price: 0, condition: 'GOOD' })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: ReturnFormData) => {
    setSubmitError(null)

    try {
      if (returnRecord) {
        // For existing returns, only allow updating certain fields
        await updateReturn(returnRecord.id, {
          refund_method: data.refund_method,
          reason: data.reason,
        })
      } else {
        // Create new return
        await createReturn({
          sale_id: data.sale_id || undefined,
          store_id: data.store_id,
          return_date: data.return_date,
          return_type: data.return_type,
          refund_method: data.refund_method,
          reason: data.reason,
          status: data.status,
          items: data.items,
        })
      }
      
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleApprove = async () => {
    if (!returnRecord) return
    setSubmitError(null)

    try {
      await approveReturn(returnRecord.id)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to approve return')
    }
  }

  const handleReject = async () => {
    if (!returnRecord) return
    setSubmitError(null)

    try {
      await rejectReturn(returnRecord.id, watch('reason'))
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to reject return')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSubmitError(null)
  }

  const isViewOnly = !!returnRecord
  const canApprove = returnRecord?.status === 'PENDING'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {returnRecord ? `Return Details - ${returnRecord.return_number}` : 'Create New Return'}
          </DialogTitle>
          <DialogDescription>
            {returnRecord ? 'View and manage return information' : 'Create a new product return'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Return Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="store_id">Store *</Label>
                  <Select
                    value={watch('store_id')}
                    onValueChange={(value) => setValue('store_id', value)}
                    disabled={isViewOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.store_id && (
                    <span className="text-sm text-red-600">Store is required</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="return_date">Return Date</Label>
                  <Input
                    id="return_date"
                    type="date"
                    {...register('return_date')}
                    disabled={isViewOnly}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="return_type">Return Type</Label>
                  <Select
                    value={watch('return_type')}
                    onValueChange={(value) => setValue('return_type', value)}
                    disabled={isViewOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">Customer Return</SelectItem>
                      <SelectItem value="SUPPLIER">Supplier Return</SelectItem>
                      <SelectItem value="DAMAGED">Damaged Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sale_id">Original Sale ID (Optional)</Label>
                  <Input
                    id="sale_id"
                    {...register('sale_id')}
                    placeholder="Enter sale ID if applicable"
                    disabled={isViewOnly}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="refund_method">Refund Method</Label>
                  <Select
                    value={watch('refund_method')}
                    onValueChange={(value) => setValue('refund_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="CREDIT">Store Credit</SelectItem>
                      <SelectItem value="EXCHANGE">Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Return</Label>
                <Textarea
                  id="reason"
                  {...register('reason')}
                  rows={3}
                  placeholder="Describe the reason for this return..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Return Items */}
          {!isViewOnly && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Return Items</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end border-b pb-4">
                    <div className="flex-1">
                      <Label>Product *</Label>
                      <Select
                        value={watchedItems[index]?.product_id || ''}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.selling_price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="w-32">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.unit_price`, {
                          required: true,
                          min: 0,
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="w-32">
                      <Label>Condition</Label>
                      <Select
                        value={watchedItems[index]?.condition || 'GOOD'}
                        onValueChange={(value) => setValue(`items.${index}.condition`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="DAMAGED">Damaged</SelectItem>
                          <SelectItem value="DEFECTIVE">Defective</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center font-semibold">
                        $
                        {(watchedItems[index]?.quantity * watchedItems[index]?.unit_price || 0).toFixed(2)}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Display items for existing returns */}
          {isViewOnly && returnRecord?.return_items && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Return Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {returnRecord.return_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.product?.sku} | Condition: {item.condition}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{item.quantity} × ${item.unit_price.toFixed(2)}</div>
                        <div className="font-semibold">${item.total_price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Return Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Refund Amount:</span>
                  <span>
                    ${isViewOnly ? returnRecord?.refund_amount.toFixed(2) : calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
                {isViewOnly && returnRecord && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Status:</span>
                    <span className="font-medium">{returnRecord.status}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {submitError}
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {isViewOnly ? 'Close' : 'Cancel'}
              </Button>
              
              {canApprove && (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              
              {!canApprove && (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : isViewOnly ? 'Update Return' : 'Create Return'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}