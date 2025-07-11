"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
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
    unit: "Each",
    price: 0,
    total: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedData = {
      ...itemData,
      [name]: name === "quantity" || name === "price" ? Number(value) : value,
    }

    // Calculate total when price or quantity changes
    if (name === "price" || name === "quantity") {
      updatedData.total = updatedData.price * updatedData.quantity
    }

    setItemData(updatedData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddItem(itemData)
    setItemData({
      description: "",
      quantity: 1,
      unit: "Each",
      price: 0,
      total: 0,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Item
              </CardTitle>
              <CardDescription className="text-purple-100">
                Add a new product or service to your quotation
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
                placeholder="Enter detailed description of the product or service"
                className="border-2 border-gray-200 focus:border-purple-500 transition-colors resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={itemData.quantity}
                  onChange={handleInputChange}
                  min={1}
                  className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
                  required
                />
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
                  className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                  Unit Price *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={itemData.price}
                  onChange={handleInputChange}
                  min={0}
                  className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Total</Label>
              <Input
                value={itemData.total.toFixed(2)}
                className="border-2 border-gray-200 bg-gray-50 font-semibold"
                disabled
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
