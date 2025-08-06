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
import { Trash2, Plus, ShoppingCart } from 'lucide-react'
import { Sale, Product, Store as StoreType } from '@/lib/types'
import { useSales } from '../hooks/use-sales'
import { useProducts } from '../../inventory/hooks/use-products'
import { useStores } from '../../inventory/hooks/use-stores'
import { format } from 'date-fns'

interface SaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale?: Sale | null
  onSuccess?: () => void
}

interface SaleItemFormData {
  product_id: string
  quantity: number
  unit_price: number
  discount_amount: number
}

interface SaleFormData {
  store_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  sale_date: string
  payment_method: string
  payment_status: string
  discount_amount: number
  tax_amount: number
  notes: string
  items: SaleItemFormData[]
}

export function SaleDialog({ open, onOpenChange, sale, onSuccess }: SaleDialogProps) {
  const { createSale, updateSale, loading } = useSales()
  const { products, fetchProducts } = useProducts()
  const { stores } = useStores()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SaleFormData>({
    defaultValues: {
      store_id: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      sale_date: new Date().toISOString().split('T')[0],
      payment_method: 'CASH',
      payment_status: 'PAID',
      discount_amount: 0,
      tax_amount: 0,
      notes: '',
      items: [{ product_id: '', quantity: 1, unit_price: 0, discount_amount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchedDiscount = watch('discount_amount')
  const watchedTax = watch('tax_amount')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (sale) {
      reset({
        store_id: sale.store_id || '',
        customer_name: sale.customer_name || '',
        customer_phone: sale.customer_phone || '',
        customer_email: sale.customer_email || '',
        sale_date: sale.sale_date,
        payment_method: sale.payment_method || 'CASH',
        payment_status: sale.payment_status,
        discount_amount: sale.discount_amount,
        tax_amount: sale.tax_amount,
        notes: sale.notes || '',
        items: sale.sale_items?.map(item => ({
          product_id: item.product_id || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
        })) || [],
      })
    } else {
      reset({
        store_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        sale_date: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        payment_status: 'PAID',
        discount_amount: 0,
        tax_amount: 0,
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_price: 0, discount_amount: 0 }],
      })
    }
  }, [sale, reset])

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setValue(`items.${index}.product_id`, productId)
      setValue(`items.${index}.unit_price`, product.selling_price)
    }
  }

  const calculateSubtotal = () => {
    return watchedItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price) - item.discount_amount
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + (watchedTax || 0) - (watchedDiscount || 0)
  }

  const addItem = () => {
    append({ product_id: '', quantity: 1, unit_price: 0, discount_amount: 0 })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: SaleFormData) => {
    setSubmitError(null)

    try {
      if (sale) {
        // For existing sales, only allow updating customer info and payment details
        await updateSale(sale.id, {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_email: data.customer_email,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          notes: data.notes,
        })
      } else {
        // Create new sale
        await createSale({
          store_id: data.store_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_email: data.customer_email,
          sale_date: data.sale_date,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          discount_amount: data.discount_amount,
          tax_amount: data.tax_amount,
          notes: data.notes,
          items: data.items,
        })
      }
      
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSubmitError(null)
  }

  const isViewOnly = !!sale

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sale ? `Sale Details - ${sale.invoice_number}` : 'Create New Sale'}
          </DialogTitle>
          <DialogDescription>
            {sale ? 'View and update sale information' : 'Create a new sales transaction'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    {...register('customer_name')}
                    placeholder="Walk-in customer"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="customer_phone">Phone Number</Label>
                  <Input
                    id="customer_phone"
                    {...register('customer_phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customer_email">Email Address</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...register('customer_email')}
                  placeholder="customer@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sale Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sale Details</CardTitle>
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
                  <Label htmlFor="sale_date">Sale Date</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    {...register('sale_date')}
                    disabled={isViewOnly}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={watch('payment_method')}
                    onValueChange={(value) => setValue('payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={watch('payment_status')}
                  onValueChange={(value) => setValue('payment_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sale Items */}
          {!isViewOnly && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Sale Items</CardTitle>
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
                      <Label>Discount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.discount_amount`, {
                          min: 0,
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="w-32">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center font-semibold">
                        $
                        {(
                          (watchedItems[index]?.quantity * watchedItems[index]?.unit_price || 0) -
                          (watchedItems[index]?.discount_amount || 0)
                        ).toFixed(2)}
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

          {/* Display items for existing sales */}
          {isViewOnly && sale?.sale_items && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sale Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sale.sale_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.product?.sku}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{item.quantity} × ${item.unit_price.toFixed(2)}</div>
                        {item.discount_amount > 0 && (
                          <div className="text-sm text-red-600">
                            -${item.discount_amount.toFixed(2)}
                          </div>
                        )}
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
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {!isViewOnly && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discount_amount">Order Discount</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('discount_amount', {
                        min: 0,
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tax_amount">Tax Amount</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('tax_amount', {
                        min: 0,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${isViewOnly ? sale?.subtotal.toFixed(2) : calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${isViewOnly ? sale?.tax_amount.toFixed(2) : (watchedTax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${isViewOnly ? sale?.discount_amount.toFixed(2) : (watchedDiscount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${isViewOnly ? sale?.total_amount.toFixed(2) : calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder="Additional notes about this sale..."
            />
          </div>

          {submitError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {isViewOnly ? 'Close' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isViewOnly ? 'Update Sale' : 'Create Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}