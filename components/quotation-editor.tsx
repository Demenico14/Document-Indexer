"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, Calendar, User, Building, Mail, Phone, Save, Check } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { calculateTotals } from "@/lib/quotation-utils"
import { AddItemModal } from "@/components/add-item-modal"
import { useToast } from "@/hooks/use-toast"
import type { QuotationData, LineItem } from "@/lib/types"

interface QuotationEditorProps {
  quotationData: QuotationData
  onUpdateQuotation: (data: QuotationData) => void
  onReorderLineItems: (items: LineItem[]) => void
}

export function QuotationEditor({ quotationData, onUpdateQuotation, onReorderLineItems }: QuotationEditorProps) {
  const [editingData, setEditingData] = useState<QuotationData>(quotationData)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Update editingData when quotationData prop changes
  useEffect(() => {
    setEditingData(quotationData)
    setHasUnsavedChanges(false)
  }, [quotationData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let updatedData = { ...editingData }

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")

      // Make sure we're only updating valid parent objects
      if (parent === "customer") {
        updatedData = {
          ...editingData,
          customer: {
            ...editingData.customer,
            [child]: value,
          },
        }
      } else {
        // Handle other potential nested objects here if needed
        console.warn(`Unhandled nested property: ${name}`)
        return
      }
    } else {
      // For top-level properties
      updatedData = {
        ...editingData,
        [name]: value,
      }
    }

    setEditingData(updatedData)
    setHasUnsavedChanges(true)

    // Auto-update the preview with changes
    onUpdateQuotation(updatedData)
  }

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...editingData.lineItems]

    // Update the specific field
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // If price or quantity changed, recalculate total
    if (field === "price" || field === "quantity") {
      const price = field === "price" ? Number(value) : Number(updatedItems[index].price)
      const quantity = field === "quantity" ? Number(value) : Number(updatedItems[index].quantity)
      updatedItems[index].total = price * quantity
    }

    const updatedData = {
      ...editingData,
      lineItems: updatedItems,
    }

    // Recalculate totals
    const { subtotal, markupAmount, totalAmount } = calculateTotals(updatedItems, editingData.markupRate)

    const finalUpdatedData = {
      ...updatedData,
      subtotal,
      markupAmount,
      totalAmount,
    }

    setEditingData(finalUpdatedData)
    setHasUnsavedChanges(true)

    // Auto-update the preview with changes
    onUpdateQuotation(finalUpdatedData)
  }

  const handleAddItem = (newItemData: Omit<LineItem, "id" | "no">) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      no: editingData.lineItems.length + 1,
      ...newItemData,
    }

    const updatedItems = [...editingData.lineItems, newItem]

    // Recalculate totals
    const { subtotal, markupAmount, totalAmount } = calculateTotals(updatedItems, editingData.markupRate)

    const updatedData = {
      ...editingData,
      lineItems: updatedItems,
      subtotal,
      markupAmount,
      totalAmount,
    }

    setEditingData(updatedData)
    setHasUnsavedChanges(true)
    onUpdateQuotation(updatedData)
  }

  const handleRemoveLineItem = (index: number) => {
    const updatedItems = [...editingData.lineItems]
    updatedItems.splice(index, 1)

    // Renumber items
    updatedItems.forEach((item, idx) => {
      item.no = idx + 1
    })

    // Recalculate totals
    const { subtotal, markupAmount, totalAmount } = calculateTotals(updatedItems, editingData.markupRate)

    const updatedData = {
      ...editingData,
      lineItems: updatedItems,
      subtotal,
      markupAmount,
      totalAmount,
    }

    setEditingData(updatedData)
    setHasUnsavedChanges(true)
    onUpdateQuotation(updatedData)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(editingData.lineItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Renumber items
    items.forEach((item, idx) => {
      item.no = idx + 1
    })

    const updatedData = {
      ...editingData,
      lineItems: items,
    }

    setEditingData(updatedData)
    setHasUnsavedChanges(true)
    onReorderLineItems(items)
    onUpdateQuotation(updatedData)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate save operation
      await new Promise((resolve) => setTimeout(resolve, 500))

      onUpdateQuotation(editingData)
      setHasUnsavedChanges(false)

      toast({
        title: "Quotation Saved",
        description: "Your quotation has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your quotation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header Section with Save Status */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Quotation Editor</h1>
        <p className="text-gray-600">Create and customize your sales quotation</p>
        {hasUnsavedChanges && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            Changes are being auto-saved to preview
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quotation Details Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quotation Details
            </CardTitle>
            <CardDescription className="text-blue-100">Essential information about this quotation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentNumber" className="text-sm font-semibold text-gray-700">
                  Document Number *
                </Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={editingData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., QUO-2024-001"
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentDate" className="text-sm font-semibold text-gray-700">
                  Document Date *
                </Label>
                <Input
                  id="documentDate"
                  name="documentDate"
                  type="date"
                  value={editingData.documentDate}
                  onChange={handleInputChange}
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil" className="text-sm font-semibold text-gray-700">
                Valid Until *
              </Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                value={editingData.validUntil}
                onChange={handleInputChange}
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500">Set the expiration date for this quotation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesEmployee" className="text-sm font-semibold text-gray-700">
                  Sales Employee
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="salesEmployee"
                    name="salesEmployee"
                    value={editingData.salesEmployee}
                    onChange={handleInputChange}
                    placeholder="Enter sales representative name"
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">
                  Currency
                </Label>
                <Input
                  id="currency"
                  name="currency"
                  value={editingData.currency}
                  onChange={handleInputChange}
                  placeholder="e.g., USD, EUR, GBP"
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markupRate" className="text-sm font-semibold text-gray-700">
                Markup Rate (%)
              </Label>
              <Input
                id="markupRate"
                name="markupRate"
                type="number"
                value={editingData.markupRate}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> The markup is applied to the subtotal and is not shown on the final quotation.
                  It's used for internal pricing calculations only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription className="text-green-100">Details about your customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="customer.name" className="text-sm font-semibold text-gray-700">
                Customer Name *
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="customer.name"
                  name="customer.name"
                  value={editingData.customer.name}
                  onChange={handleInputChange}
                  placeholder="Enter company or individual name"
                  className="pl-10 border-2 border-gray-200 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer.address" className="text-sm font-semibold text-gray-700">
                Address *
              </Label>
              <Textarea
                id="customer.address"
                name="customer.address"
                value={editingData.customer.address}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter complete address including street, city, state, and postal code"
                className="border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer.vatNumber" className="text-sm font-semibold text-gray-700">
                  VAT Number
                </Label>
                <Input
                  id="customer.vatNumber"
                  name="customer.vatNumber"
                  value={editingData.customer.vatNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., GB123456789"
                  className="border-2 border-gray-200 focus:border-green-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer.tin" className="text-sm font-semibold text-gray-700">
                  Tax Identification Number
                </Label>
                <Input
                  id="customer.tin"
                  name="customer.tin"
                  value={editingData.customer.tin}
                  onChange={handleInputChange}
                  placeholder="Enter TIN"
                  className="border-2 border-gray-200 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer.phone" className="text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="customer.phone"
                    name="customer.phone"
                    value={editingData.customer.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10 border-2 border-gray-200 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer.email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="customer.email"
                    name="customer.email"
                    type="email"
                    value={editingData.customer.email}
                    onChange={handleInputChange}
                    placeholder="customer@example.com"
                    className="pl-10 border-2 border-gray-200 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Line Items</CardTitle>
              <CardDescription className="text-purple-100">Products and services in this quotation</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddItemModal(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="line-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {editingData.lineItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="space-y-3">
                        <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Plus className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No items added yet</p>
                        <p className="text-sm text-gray-400">Click "Add Item" to get started with your quotation</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingData.lineItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-all duration-200 ${
                                snapshot.isDragging ? "shadow-lg scale-105 rotate-2" : "hover:shadow-md"
                              }`}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  {/* Drag Handle */}
                                  <div {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing mt-2">
                                    <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  </div>

                                  {/* Item Number */}
                                  <div className="flex-shrink-0">
                                    <Label className="text-xs text-gray-500">No.</Label>
                                    <Input value={item.no} className="w-16 h-8 text-center font-medium" disabled />
                                  </div>

                                  {/* Main Content */}
                                  <div className="flex-1 space-y-4">
                                    {/* Product Info Row */}
                                    {(item.brand || item.model || item.category) && (
                                      <div className="flex flex-wrap gap-2">
                                        {item.brand && <Badge variant="secondary">{item.brand}</Badge>}
                                        {item.model && <Badge variant="outline">{item.model}</Badge>}
                                        {item.category && <Badge variant="default">{item.category}</Badge>}
                                      </div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">Description</Label>
                                      <Textarea
                                        value={item.description}
                                        onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                                        className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-purple-500 transition-colors font-mono text-sm leading-relaxed"
                                        placeholder="Enter detailed description of the product or service"
                                        rows={6}
                                      />
                                    </div>

                                    {/* Quantity, Unit, Price Row */}
                                    <div className="grid grid-cols-4 gap-4">
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Quantity</Label>
                                        <Input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) =>
                                            handleLineItemChange(index, "quantity", Number.parseInt(e.target.value))
                                          }
                                          className="h-8 text-center border-2 border-gray-200 focus:border-purple-500 transition-colors"
                                          min={1}
                                          placeholder="1"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Unit</Label>
                                        <Input
                                          value={item.unit}
                                          onChange={(e) => handleLineItemChange(index, "unit", e.target.value)}
                                          className="h-8 text-center border-2 border-gray-200 focus:border-purple-500 transition-colors"
                                          placeholder="pcs"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Price</Label>
                                        <Input
                                          type="number"
                                          value={item.price}
                                          onChange={(e) =>
                                            handleLineItemChange(index, "price", Number.parseFloat(e.target.value))
                                          }
                                          className="h-8 text-right border-2 border-gray-200 focus:border-purple-500 transition-colors"
                                          step="0.01"
                                          min={0}
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Total</Label>
                                        <Input
                                          value={item.total.toFixed(2)}
                                          className="h-8 text-right font-semibold bg-gray-50"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Remove Button */}
                                  <div className="flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveLineItem(index)}
                                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {editingData.lineItems.length > 0 && (
            <div className="mt-8 flex justify-end">
              <div className="w-80 space-y-3 bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    {editingData.currency} {editingData.subtotal.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-purple-600">
                    {editingData.currency} {editingData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {editingData.lineItems.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-xs text-blue-800">
                <strong>Pricing Note:</strong> The prices shown are base prices before markup. A markup of{" "}
                {editingData.markupRate}% is applied to the subtotal to calculate the final total amount.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <CardTitle>Additional Information</CardTitle>
          <CardDescription className="text-orange-100">Notes, terms, and payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={editingData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Add any additional notes about the products, services, or special instructions..."
              className="border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500">These notes will appear on the quotation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsAndConditions" className="text-sm font-semibold text-gray-700">
              Terms and Conditions
            </Label>
            <Textarea
              id="termsAndConditions"
              name="termsAndConditions"
              value={editingData.termsAndConditions}
              onChange={handleInputChange}
              rows={6}
              placeholder="Enter your standard terms and conditions, payment terms, delivery conditions, etc..."
              className="border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-semibold text-gray-700">
              Remarks
            </Label>
            <Textarea
              id="remarks"
              name="remarks"
              value={editingData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional remarks or special conditions..."
              className="border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankDetails" className="text-sm font-semibold text-gray-700">
              Bank Details
            </Label>
            <Textarea
              id="bankDetails"
              name="bankDetails"
              value={editingData.bankDetails}
              onChange={handleInputChange}
              rows={5}
              placeholder="Enter your bank account details for payment processing..."
              className="border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="px-12 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          )}
        </Button>
      </div>

      <AddItemModal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} onAddItem={handleAddItem} />
    </div>
  )
}
