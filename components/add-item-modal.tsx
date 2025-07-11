"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Monitor, Cpu, HardDrive, Zap, Settings } from "lucide-react"
import type { LineItem } from "@/lib/types"

const COMMON_SPECS = [
  { key: "display", label: "Display", icon: Monitor, placeholder: "e.g., 15.6 inch, 1920x1080" },
  { key: "processor", label: "Processor", icon: Cpu, placeholder: "e.g., Intel i7, AMD Ryzen 5" },
  { key: "storage", label: "Storage", icon: HardDrive, placeholder: "e.g., 512GB SSD, 1TB HDD" },
  { key: "graphics", label: "Graphics", icon: Monitor, placeholder: "e.g., NVIDIA GTX 1650, Integrated" },
  { key: "connectivity", label: "Connectivity", icon: Zap, placeholder: "e.g., Wi-Fi 6, Bluetooth 5.0" },
  { key: "security", label: "Security", icon: Settings, placeholder: "e.g., Fingerprint, Face ID" },
  { key: "battery", label: "Battery", icon: Zap, placeholder: "e.g., 5000mAh, 10 hours" },
  { key: "memory", label: "Memory", icon: Cpu, placeholder: "e.g., 16GB RAM, DDR4" },
]

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "price" ? Number(value) : value,
    }))
  }

  const handleSpecChange = (specKey: string, value: string) => {
    setSpecs((prev) => ({
      ...prev,
      [specKey]: value,
    }))
  }

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const newSpecs = { ...prev }
      delete newSpecs[key]
      return newSpecs
    })
  }

  const generateDescription = () => {
    let description = ""

    // Product title
    const titleParts = []
    if (formData.brand) titleParts.push(formData.brand)
    if (formData.model) titleParts.push(formData.model)

    if (titleParts.length > 0) {
      description += titleParts.join(" ") + "\n\n"
    }

    // Main description
    description += formData.description

    // Add key specifications if any exist
    const filledSpecs = Object.entries(specs).filter(([_, value]) => value.trim())
    if (filledSpecs.length > 0) {
      description += "\n\nKey Features:\n"
      filledSpecs.forEach(([key, value]) => {
        const specInfo = COMMON_SPECS.find((s) => s.key === key)
        const label = specInfo?.label || key
        description += `• ${label}: ${value}\n`
      })
    }

    return description
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      return
    }

    const newItem: Omit<LineItem, "id" | "no"> = {
      description: generateDescription(),
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
    onClose()
  }

  const total = formData.quantity * formData.price

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Item</DialogTitle>
          <DialogDescription>Add a new product or service with detailed specifications</DialogDescription>
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
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
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
                placeholder="Enter a clear, concise description of the product or service..."
                rows={3}
                className="resize-none"
                required
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Technical Specifications</h3>
            <p className="text-sm text-gray-600">
              Fill in the relevant specifications. These will appear as separate columns in the quotation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMMON_SPECS.map((spec) => {
                const IconComponent = spec.icon
                return (
                  <div key={spec.key} className="space-y-2">
                    <Label htmlFor={spec.key} className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {spec.label}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={spec.key}
                        value={specs[spec.key] || ""}
                        onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                        placeholder={spec.placeholder}
                        className="flex-1"
                      />
                      {specs[spec.key] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpec(spec.key)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
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
                  {total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(formData.description || Object.keys(specs).some((key) => specs[key])) && (
            <div className="space-y-2">
              <Label>Description Preview</Label>
              <div className="p-3 bg-gray-50 border rounded-md text-sm whitespace-pre-line max-h-32 overflow-y-auto">
                {generateDescription() || "Enter a description to see preview..."}
              </div>
            </div>
          )}

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
