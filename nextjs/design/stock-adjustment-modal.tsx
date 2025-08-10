"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Minus, RotateCcw } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  category: string
  supplier: string
}

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
  onAdjustStock: (itemId: string, newStock: number, adjustmentType: string, reason: string, notes: string) => void
}

export function StockAdjustmentModal({ isOpen, onClose, item, onAdjustStock }: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<string>("")
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!item) return null

  const calculateNewStock = () => {
    const amount = parseInt(adjustmentAmount) || 0
    switch (adjustmentType) {
      case "increase":
        return item.stock + amount
      case "decrease":
        return Math.max(0, item.stock - amount)
      case "set":
        return amount
      default:
        return item.stock
    }
  }

  const newStock = calculateNewStock()
  const stockDifference = newStock - item.stock

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustmentType || !adjustmentAmount || !reason) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onAdjustStock(item.id, newStock, adjustmentType, reason, notes)
    
    // Reset form
    setAdjustmentType("")
    setAdjustmentAmount("")
    setReason("")
    setNotes("")
    setIsSubmitting(false)
    onClose()
  }

  const handleClose = () => {
    setAdjustmentType("")
    setAdjustmentAmount("")
    setReason("")
    setNotes("")
    onClose()
  }

  const getStockStatusColor = (stock: number, minStock: number) => {
    if (stock === 0) return "text-red-600"
    if (stock <= minStock * 0.5) return "text-red-600"
    if (stock <= minStock) return "text-yellow-600"
    return "text-green-600"
  }

  const getAdjustmentIcon = () => {
    switch (adjustmentType) {
      case "increase":
        return <Plus className="w-4 h-4 text-green-600" />
      case "decrease":
        return <Minus className="w-4 h-4 text-red-600" />
      case "set":
        return <RotateCcw className="w-4 h-4 text-blue-600" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Adjust Stock Quantity
          </DialogTitle>
          <DialogDescription>
            Update the stock quantity for this product. All changes will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className={`text-lg font-semibold ${getStockStatusColor(item.stock, item.minStock)}`}>
                  {item.stock} units
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type */}
            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select adjustment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-green-600" />
                      Increase Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="decrease">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-red-600" />
                      Decrease Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                      Set Exact Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Adjustment Amount */}
            <div className="space-y-2">
              <Label htmlFor="adjustment-amount">
                {adjustmentType === "set" ? "New Stock Quantity" : "Adjustment Amount"}
              </Label>
              <Input
                id="adjustment-amount"
                type="number"
                min="0"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder={adjustmentType === "set" ? "Enter new stock quantity" : "Enter adjustment amount"}
              />
            </div>

            {/* Stock Preview */}
            {adjustmentType && adjustmentAmount && (
              <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAdjustmentIcon()}
                    <span className="text-sm font-medium">Stock Change Preview</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{item.stock}</span>
                      <span>→</span>
                      <span className={`font-semibold ${getStockStatusColor(newStock, item.minStock)}`}>
                        {newStock}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stockDifference > 0 ? `+${stockDifference}` : stockDifference} units
                    </div>
                  </div>
                </div>
                {newStock <= item.minStock && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                    <Badge variant="secondary" className="text-xs">
                      Warning: Below minimum stock level ({item.minStock})
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Adjustment *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received_shipment">Received Shipment</SelectItem>
                  <SelectItem value="sold_items">Sold Items</SelectItem>
                  <SelectItem value="damaged_items">Damaged Items</SelectItem>
                  <SelectItem value="returned_items">Returned Items</SelectItem>
                  <SelectItem value="inventory_count">Physical Inventory Count</SelectItem>
                  <SelectItem value="expired_items">Expired Items</SelectItem>
                  <SelectItem value="theft_loss">Theft/Loss</SelectItem>
                  <SelectItem value="transfer">Transfer to Another Location</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details about this adjustment..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!adjustmentType || !adjustmentAmount || !reason || isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Stock"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
