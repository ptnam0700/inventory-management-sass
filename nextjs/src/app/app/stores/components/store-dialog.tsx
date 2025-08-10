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
import { Store } from '@/lib/types'
import { useStores } from '../../inventory/hooks/use-stores'

interface StoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  store?: Store | null
  onSuccess?: () => void
}

interface StoreFormData {
  name: string
  location: string
  phone: string
  email: string
  is_active: boolean
}

export function StoreDialog({ open, onOpenChange, store, onSuccess }: StoreDialogProps) {
  const { createStore, updateStore, loading } = useStores()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StoreFormData>({
    defaultValues: {
      name: '',
      location: '',
      phone: '',
      email: '',
      is_active: true,
    },
  })

  const isActive = watch('is_active')

  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        location: store.location || '',
        phone: store.phone || '',
        email: store.email || '',
        is_active: store.is_active,
      })
    } else {
      reset({
        name: '',
        location: '',
        phone: '',
        email: '',
        is_active: true,
      })
    }
  }, [store, reset])

  const onSubmit = async (data: StoreFormData) => {
    setSubmitError(null)

    try {
      const storeData = {
        ...data,
        location: data.location || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
      }

      if (store) {
        await updateStore(store.id, storeData)
      } else {
        await createStore(storeData)
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
          <DialogTitle>{store ? 'Edit Store' : 'Add New Store'}</DialogTitle>
          <DialogDescription>
            {store ? 'Update store information' : 'Add a new store location'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Store name is required' })}
                placeholder="Enter store name"
              />
              {errors.name && (
                <span className="text-sm text-red-600">{errors.name.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Textarea
                id="location"
                {...register('location')}
                placeholder="Enter store address or location"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone', {
                    pattern: {
                      value: /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  placeholder="Phone number"
                />
                {errors.phone && (
                  <span className="text-sm text-red-600">{errors.phone.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  placeholder="store@example.com"
                />
                {errors.email && (
                  <span className="text-sm text-red-600">{errors.email.message}</span>
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
              <span className="text-sm text-muted-foreground ml-2">
                {isActive ? 'Store is active and operational' : 'Store is inactive'}
              </span>
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
              {loading ? 'Saving...' : store ? 'Update Store' : 'Add Store'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}