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
import { Switch } from '@/components/ui/switch'
import { Product } from '@/lib/types'
import { useProducts } from '../hooks/use-products'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess?: () => void
}

interface ProductFormData {
  name: string
  description: string
  sku: string
  barcode: string
  unit_of_measure: string
  cost_price: number
  selling_price: number
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  is_active: boolean
}

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
  const { createProduct, updateProduct, loading } = useProducts()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      unit_of_measure: 'pcs',
      cost_price: 0,
      selling_price: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      reorder_point: 0,
      is_active: true,
    },
  })

  const isActive = watch('is_active')

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        unit_of_measure: product.unit_of_measure,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        min_stock_level: product.min_stock_level,
        max_stock_level: product.max_stock_level || 0,
        reorder_point: product.reorder_point,
        is_active: product.is_active,
      })
    } else {
      reset({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        unit_of_measure: 'pcs',
        cost_price: 0,
        selling_price: 0,
        min_stock_level: 0,
        max_stock_level: 0,
        reorder_point: 0,
        is_active: true,
      })
    }
  }, [product, reset])

  const onSubmit = async (data: ProductFormData) => {
    setSubmitError(null)

    try {
      if (product) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Add a new product to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
              />
              {errors.name && (
                <span className="text-sm text-red-600">{errors.name.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  {...register('sku', { required: 'SKU is required' })}
                />
                {errors.sku && (
                  <span className="text-sm text-red-600">{errors.sku.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Input
                id="unit_of_measure"
                {...register('unit_of_measure')}
                placeholder="e.g., pcs, kg, liters"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cost_price">Cost Price *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('cost_price', { 
                    required: 'Cost price is required',
                    min: { value: 0, message: 'Cost price must be positive' }
                  })}
                />
                {errors.cost_price && (
                  <span className="text-sm text-red-600">{errors.cost_price.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('selling_price', { 
                    required: 'Selling price is required',
                    min: { value: 0, message: 'Selling price must be positive' }
                  })}
                />
                {errors.selling_price && (
                  <span className="text-sm text-red-600">{errors.selling_price.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_stock_level">Min Stock</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  min="0"
                  {...register('min_stock_level', {
                    min: { value: 0, message: 'Must be positive' }
                  })}
                />
                {errors.min_stock_level && (
                  <span className="text-sm text-red-600">{errors.min_stock_level.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max_stock_level">Max Stock</Label>
                <Input
                  id="max_stock_level"
                  type="number"
                  min="0"
                  {...register('max_stock_level', {
                    min: { value: 0, message: 'Must be positive' }
                  })}
                />
                {errors.max_stock_level && (
                  <span className="text-sm text-red-600">{errors.max_stock_level.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  min="0"
                  {...register('reorder_point', {
                    min: { value: 0, message: 'Must be positive' }
                  })}
                />
                {errors.reorder_point && (
                  <span className="text-sm text-red-600">{errors.reorder_point.message}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}