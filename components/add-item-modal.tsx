"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
    specs: {} as Record<string, string>,
  })

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
      setFormData((prev) => ({
        ...prev,
        specs: {
          ...prev.specs,
          [newSpecKey.trim()]: newSpecValue.trim(),
        },
      }))
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: Object.fromEntries(Object.entries(prev.specs).filter(([k]) => k !== key)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      return
    }

    const total = formData.quantity * formData.price

    onAddItem({
      description: formData.description,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.price,
      total,
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      model: formData.model || undefined,
      specs: Object.keys(formData.specs).length > 0 ? formData.specs : undefined,
    })

    // Reset form
    setFormData({
      description: "",
      quantity: 1,
      unit: "Each",
      price: 0,
      category: "",
      brand: "",
      model: "",
      specs: {},
    })
    setNewSpecKey("")
    setNewSpecValue("")

    onClose()
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      description: "",
      quantity: 1,
      unit: "Each",
      price: 0,
      category: "",
      brand: "",
      model: "",
      specs: {},
    })
    setNewSpecKey("")
    setNewSpecValue("")
    onClose()
  }

  const calculatedTotal = formData.quantity * formData.price

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
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Existing Specs */}
            {Object.keys(formData.specs).length > 0 && (
              <div className="space-y-2">
                <Label>Current Specifications</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.specs).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="flex items-center gap-1">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                      <button type="button" onClick={() => handleRemoveSpec(key)} className="ml-1 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Spec */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <div className="space-y-2">
                <Label htmlFor="specKey">Specification Name</Label>
                <Input
                  id="specKey"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="e.g., Display, Processor, Storage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specValue">Value</Label>
                <Input
                  id="specValue"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="e.g., 15.6 inch, Intel i7, 512GB SSD"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddSpec}
                disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                className="h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
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
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Each">Each</SelectItem>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                    <SelectItem value="Hour">Hour</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Month">Month</SelectItem>
                    <SelectItem value="Year">Year</SelectItem>
                  </SelectContent>
                </Select>
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
                  {calculatedTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.description.trim()} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
