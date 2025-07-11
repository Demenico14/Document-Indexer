"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Upload, FileText, DollarSign, Package, User, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AddItemModal } from "./add-item-modal"
import { extractTechSpecs, createStructuredLineItems } from "@/lib/tech-spec-extractor"

interface QuotationEditorProps {
  quotationData: any
  onQuotationUpdate: (data: any) => void
  importedRecords?: any[]
}

export function QuotationEditor({ quotationData, onQuotationUpdate, importedRecords = [] }: QuotationEditorProps) {
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    // Auto-import records when they become available
    if (importedRecords.length > 0 && quotationData.lineItems.length === 0) {
      handleImportRecords()
    }
  }, [importedRecords])

  const handleImportRecords = () => {
    if (importedRecords.length === 0) {
      toast({
        title: "No Records Available",
        description: "Please import some records first from the Search tab.",
        variant: "destructive",
      })
      return
    }

    try {
      // Extract technical specifications using enhanced NLP
      const extractedProducts = extractTechSpecs(importedRecords)

      if (extractedProducts.length === 0) {
        toast({
          title: "No Products Extracted",
          description: "Could not extract product information from the imported records.",
          variant: "destructive",
        })
        return
      }

      // Create structured line items
      const structuredItems = createStructuredLineItems(extractedProducts)

      // Update quotation data
      const updatedData = {
        ...quotationData,
        lineItems: [...quotationData.lineItems, ...structuredItems],
      }

      onQuotationUpdate(updatedData)

      toast({
        title: "Records Imported Successfully",
        description: `Added ${structuredItems.length} items to your quotation with enhanced technical specifications.`,
      })
    } catch (error) {
      console.error("Error importing records:", error)
      toast({
        title: "Import Error",
        description: "There was an error processing the imported records.",
        variant: "destructive",
      })
    }
  }

  const handleAddItem = (item: any) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      no: quotationData.lineItems.length + 1,
      total: item.quantity * item.price,
    }

    const updatedData = {
      ...quotationData,
      lineItems: [...quotationData.lineItems, newItem],
    }

    onQuotationUpdate(updatedData)
    setShowAddItemModal(false)

    toast({
      title: "Item Added",
      description: "New item has been added to your quotation.",
    })
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setShowAddItemModal(true)
  }

  const handleUpdateItem = (updatedItem: any) => {
    const updatedItems = quotationData.lineItems.map((item: any) =>
      item.id === updatedItem.id ? { ...updatedItem, total: updatedItem.quantity * updatedItem.price } : item,
    )

    const updatedData = {
      ...quotationData,
      lineItems: updatedItems,
    }

    onQuotationUpdate(updatedData)
    setShowAddItemModal(false)
    setEditingItem(null)

    toast({
      title: "Item Updated",
      description: "Item has been updated successfully.",
    })
  }

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = quotationData.lineItems
      .filter((item: any) => item.id !== itemId)
      .map((item: any, index: number) => ({ ...item, no: index + 1 }))

    const updatedData = {
      ...quotationData,
      lineItems: updatedItems,
    }

    onQuotationUpdate(updatedData)

    toast({
      title: "Item Deleted",
      description: "Item has been removed from your quotation.",
    })
  }

  const handleClientInfoChange = (field: string, value: string) => {
    const updatedData = {
      ...quotationData,
      clientInfo: {
        ...quotationData.clientInfo,
        [field]: value,
      },
    }
    onQuotationUpdate(updatedData)
  }

  const handleQuotationDetailsChange = (field: string, value: string) => {
    const updatedData = {
      ...quotationData,
      quotationDetails: {
        ...quotationData.quotationDetails,
        [field]: value,
      },
    }
    onQuotationUpdate(updatedData)
  }

  const handleDescriptionChange = (itemId: string, newDescription: string) => {
    const updatedItems = quotationData.lineItems.map((item: any) =>
      item.id === itemId ? { ...item, description: newDescription } : item,
    )

    const updatedData = {
      ...quotationData,
      lineItems: updatedItems,
    }

    onQuotationUpdate(updatedData)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const updatedItems = quotationData.lineItems.map((item: any) =>
      item.id === itemId ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item,
    )

    const updatedData = {
      ...quotationData,
      lineItems: updatedItems,
    }

    onQuotationUpdate(updatedData)
  }

  const handlePriceChange = (itemId: string, newPrice: number) => {
    const updatedItems = quotationData.lineItems.map((item: any) =>
      item.id === itemId ? { ...item, price: newPrice, total: item.quantity * newPrice } : item,
    )

    const updatedData = {
      ...quotationData,
      lineItems: updatedItems,
    }

    onQuotationUpdate(updatedData)
  }

  const getTotalAmount = () => {
    return quotationData.lineItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Import Section */}
      {importedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Records
            </CardTitle>
            <CardDescription>
              {importedRecords.length} records available for import with enhanced NLP extraction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleImportRecords} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Import Records as Line Items
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={quotationData.clientInfo.name}
                onChange={(e) => handleClientInfoChange("name", e.target.value)}
                placeholder="Client Company Name"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={quotationData.clientInfo.email}
                onChange={(e) => handleClientInfoChange("email", e.target.value)}
                placeholder="client@company.com"
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={quotationData.clientInfo.phone}
                onChange={(e) => handleClientInfoChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="clientAddress">Address</Label>
              <Input
                id="clientAddress"
                value={quotationData.clientInfo.address}
                onChange={(e) => handleClientInfoChange("address", e.target.value)}
                placeholder="123 Client Street"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quotation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quotationNumber">Quotation Number</Label>
              <Input
                id="quotationNumber"
                value={quotationData.quotationDetails.quotationNumber}
                onChange={(e) => handleQuotationDetailsChange("quotationNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quotationDate">Date</Label>
              <Input
                id="quotationDate"
                type="date"
                value={quotationData.quotationDetails.date}
                onChange={(e) => handleQuotationDetailsChange("date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={quotationData.quotationDetails.validUntil}
                onChange={(e) => handleQuotationDetailsChange("validUntil", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={quotationData.quotationDetails.terms}
              onChange={(e) => handleQuotationDetailsChange("terms", e.target.value)}
              placeholder="Payment terms and conditions..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={quotationData.quotationDetails.notes}
              onChange={(e) => handleQuotationDetailsChange("notes", e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Line Items
              </CardTitle>
              <CardDescription>Manage your quotation items with detailed descriptions</CardDescription>
            </div>
            <Button onClick={() => setShowAddItemModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotationData.lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet</p>
              <p className="text-sm">Add items manually or import from your records</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotationData.lineItems.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{item.no}</Badge>
                        {item.brand && <Badge variant="secondary">{item.brand}</Badge>}
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                        {item.confidence && item.confidence < 70 && <Badge variant="destructive">Low Confidence</Badge>}
                      </div>

                      <div>
                        <Label htmlFor={`description-${item.id}`}>Description</Label>
                        <Textarea
                          id={`description-${item.id}`}
                          value={item.description}
                          onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                          rows={6}
                          className="mt-1 font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                      <Input id={`unit-${item.id}`} value={item.unit} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor={`price-${item.id}`}>Unit Price</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Total</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md font-semibold">${item.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-semibold">Total Amount: ${getTotalAmount().toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">{quotationData.lineItems.length} item(s)</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Modal */}
      {showAddItemModal && (
        <AddItemModal
          item={editingItem}
          onSave={editingItem ? handleUpdateItem : handleAddItem}
          onCancel={() => {
            setShowAddItemModal(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}
