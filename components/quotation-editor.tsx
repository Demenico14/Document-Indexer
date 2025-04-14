"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { calculateTotals } from "@/lib/quotation-utils"
import type { QuotationData, LineItem } from "@/lib/types"

interface QuotationEditorProps {
  quotationData: QuotationData
  onUpdateQuotation: (data: QuotationData) => void
  onReorderLineItems: (items: LineItem[]) => void
}

export function QuotationEditor({ quotationData, onUpdateQuotation, onReorderLineItems }: QuotationEditorProps) {
  const [editingData, setEditingData] = useState<QuotationData>(quotationData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")

      // Make sure we're only updating valid parent objects
      if (parent === "customer") {
        setEditingData({
          ...editingData,
          customer: {
            ...editingData.customer,
            [child]: value,
          },
        })
      } else {
        // Handle other potential nested objects here if needed
        console.warn(`Unhandled nested property: ${name}`)
      }
    } else {
      // For top-level properties
      setEditingData({
        ...editingData,
        [name]: value,
      })
    }
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
    const { subtotal, taxAmount, totalAmount } = calculateTotals(updatedItems, editingData.taxRate)

    setEditingData({
      ...updatedData,
      subtotal,
      taxAmount,
      totalAmount,
    })

    onUpdateQuotation({
      ...updatedData,
      subtotal,
      taxAmount,
      totalAmount,
    })
  }

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      no: editingData.lineItems.length + 1,
      description: "",
      quantity: 1,
      unit: "Each",
      price: 0,
      total: 0,
    }

    const updatedItems = [...editingData.lineItems, newItem]

    // Recalculate totals
    const { subtotal, taxAmount, totalAmount } = calculateTotals(updatedItems, editingData.taxRate)

    const updatedData = {
      ...editingData,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
    }

    setEditingData(updatedData)
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
    const { subtotal, taxAmount, totalAmount } = calculateTotals(updatedItems, editingData.taxRate)

    const updatedData = {
      ...editingData,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
    }

    setEditingData(updatedData)
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

    setEditingData({
      ...editingData,
      lineItems: items,
    })

    onReorderLineItems(items)
  }

  const handleSave = () => {
    onUpdateQuotation(editingData)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
            <CardDescription>Basic information about the quotation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={editingData.documentNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentDate">Document Date</Label>
                <Input
                  id="documentDate"
                  name="documentDate"
                  type="date"
                  value={editingData.documentDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                value={editingData.validUntil}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesEmployee">Sales Employee</Label>
                <Input
                  id="salesEmployee"
                  name="salesEmployee"
                  value={editingData.salesEmployee}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" value={editingData.currency} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                value={editingData.taxRate}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Details about the customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer.name">Customer Name</Label>
              <Input
                id="customer.name"
                name="customer.name"
                value={editingData.customer.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer.address">Address</Label>
              <Textarea
                id="customer.address"
                name="customer.address"
                value={editingData.customer.address}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer.vatNumber">VAT Number</Label>
                <Input
                  id="customer.vatNumber"
                  name="customer.vatNumber"
                  value={editingData.customer.vatNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer.tin">TIN</Label>
                <Input
                  id="customer.tin"
                  name="customer.tin"
                  value={editingData.customer.tin}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer.phone">Phone</Label>
                <Input
                  id="customer.phone"
                  name="customer.phone"
                  value={editingData.customer.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer.email">Email</Label>
                <Input
                  id="customer.email"
                  name="customer.email"
                  value={editingData.customer.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Products and services in this quotation</CardDescription>
            </div>
            <Button onClick={handleAddLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="line-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {editingData.lineItems.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No items added yet. Click "Add Item" to get started.</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-2 text-sm font-medium">
                        <div className="col-span-1"></div>
                        <div className="col-span-1">No.</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-1">Qty</div>
                        <div className="col-span-1">Unit</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Total</div>
                      </div>

                      {editingData.lineItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center"
                            >
                              <div className="col-span-1 flex items-center">
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="col-span-1">
                                <Input
                                  value={item.no}
                                  onChange={(e) => handleLineItemChange(index, "no", Number.parseInt(e.target.value))}
                                  className="h-8"
                                  disabled
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  value={item.description}
                                  onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-1">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleLineItemChange(index, "quantity", Number.parseInt(e.target.value))
                                  }
                                  className="h-8"
                                  min={1}
                                />
                              </div>
                              <div className="col-span-1">
                                <Input
                                  value={item.unit}
                                  onChange={(e) => handleLineItemChange(index, "unit", e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleLineItemChange(index, "price", Number.parseFloat(e.target.value))
                                  }
                                  className="h-8"
                                  step="0.01"
                                  min={0}
                                />
                              </div>
                              <div className="col-span-1">
                                <Input value={item.total.toFixed(2)} className="h-8" disabled />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
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

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal:</span>
                <span className="font-medium">
                  {editingData.currency} {editingData.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tax ({editingData.taxRate}%):</span>
                <span className="font-medium">
                  {editingData.currency} {editingData.taxAmount.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">
                  {editingData.currency} {editingData.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Notes, terms and payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={editingData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes about the products or services..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
            <Textarea
              id="termsAndConditions"
              name="termsAndConditions"
              value={editingData.termsAndConditions}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" value={editingData.remarks} onChange={handleInputChange} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankDetails">Bank Details</Label>
            <Textarea
              id="bankDetails"
              name="bankDetails"
              value={editingData.bankDetails}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          Save Quotation
        </Button>
      </div>
    </div>
  )
}
