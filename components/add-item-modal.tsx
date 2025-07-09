"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const [formData, setFormData] = useState({
    description: "",
    quantity: 1,
    unit: "Each",
    price: 0,
    category: "",
    brand: "",
    model: "",
  })

  const [specs, setSpecs] = useState<{ [key: string]: string }>({})
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "price" ? Number(value) : value,
    }))
  }

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs((prev) => ({
        ...prev,
        [newSpecKey.trim()]: newSpecValue.trim(),
      }))
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const newSpecs = { ...prev }
      delete newSpecs[key]
      return newSpecs
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      return
    }

    // Create enhanced description with specifications
    let enhancedDescription = formData.description

    // Add specifications to description if any exist
    if (Object.keys(specs).length > 0) {
      enhancedDescription += "\n\nTECHNICAL SPECIFICATIONS:\n"
      enhancedDescription += "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

      Object.entries(specs).forEach(([key, value]) => {
        enhancedDescription += `▪ ${key}: ${value}\n`
      })
    }

    const newItem: Omit<LineItem, "id" | "no"> = {
      description: enhancedDescription,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.price,
      total: formData.quantity * formData.price,
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      model: formData.model || undefined,
      specs: Object.keys(specs).length > 0 ? specs : undefined,
    }

    onAddItem(newItem)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      description: "",
      quantity: 1,
      unit: "Each",
      price: 0,
      category: "",
      brand: "",
      model: "",
    })
    setSpecs({})
    setNewSpecKey("")
    setNewSpecValue("")
    onClose()
  }

  const total = formData.quantity * formData.price

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Item</DialogTitle>
          <DialogDescription>
            Add a new product or service to your quotation with detailed specifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Product Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple, Dell, HP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., MacBook Pro, XPS 13"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Laptop, Phone, Service"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed description of the product or service..."
                rows={4}
                className="resize-none"
                required
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Technical Specifications</h3>

            {/* Add new specification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newSpecKey">Specification Name</Label>
                <Input
                  id="newSpecKey"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="e.g., Display, Processor, Storage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newSpecValue">Specification Value</Label>
                <div className="flex gap-2">
                  <Input
                    id="newSpecValue"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="e.g., 15.6 inch, Intel i7, 512GB SSD"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSpec}
                    disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Display existing specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="space-y-2">
                <Label>Added Specifications</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        <strong>{key}:</strong> {value}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpec(key)}
                        className="h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pricing Information</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="Each, Pcs, Hours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Unit Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center font-semibold">
                  {total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.description.trim()} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
