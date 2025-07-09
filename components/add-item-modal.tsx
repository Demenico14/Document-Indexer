"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package, Hash, Calculator } from "lucide-react"
import type { LineItem } from "@/lib/types"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: Omit<LineItem, "id" | "no">) => void
}

export function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [itemData, setItemData] = useState({
    description: "",
    quantity: 1,
    unit: "pcs",
    price: 0,
    total: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const numericValue = name === "quantity" || name === "price" ? Number(value) : value

    const updatedData = {
      ...itemData,
      [name]: numericValue,
    }

    // Recalculate total when quantity or price changes
    if (name === "quantity" || name === "price") {
      const quantity = name === "quantity" ? Number(value) : itemData.quantity
      const price = name === "price" ? Number(value) : itemData.price
      updatedData.total = quantity * price
    }

    setItemData(updatedData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemData.description.trim()) {
      onAddItem(itemData)
      setItemData({
        description: "",
        quantity: 1,
        unit: "pcs",
        price: 0,
        total: 0,
      })
      onClose()
    }
  }

  const handleCancel = () => {
    setItemData({
      description: "",
      quantity: 1,
      unit: "pcs",
      price: 0,
      total: 0,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-blue-600" />
            Add New Item
          </DialogTitle>
          <DialogDescription>Add a new product or service to your quotation</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={itemData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter a detailed description of the product or service..."
              className="border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Provide a clear and detailed description that will appear on the quotation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                Quantity *
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={itemData.quantity}
                  onChange={handleInputChange}
                  min={1}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
                Unit
              </Label>
              <Input
                id="unit"
                name="unit"
                value={itemData.unit}
                onChange={handleInputChange}
                placeholder="e.g., pcs, kg, hours"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                Unit Price *
              </Label>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={itemData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min={0}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Amount:</span>
              <span className="text-lg font-bold text-blue-600">{itemData.total.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!itemData.description.trim()}
            >
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
