"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LineItem, FileRecord } from "@/lib/types"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: Omit<LineItem, "id" | "no">) => void
}

export function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [activeTab, setActiveTab] = useState("manual")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<FileRecord[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<FileRecord | null>(null)

  // Manual entry form state
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("Each")
  const [price, setPrice] = useState(0)

  const { toast } = useToast()

  // Search for records
  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        page: "1",
        pageSize: "10",
      })

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      setSearchResults(data.records || [])
    } catch (error) {
      console.error("Error searching records:", error)
      toast({
        title: "Search failed",
        description: "Failed to search for records",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle selecting a record from search results
  const handleSelectRecord = (record: FileRecord) => {
    setSelectedRecord(record)

    // Pre-fill the form with record data
    setDescription(`${record.fieldName}: ${record.fieldValue}`)

    // Try to extract a price from the record if possible
    if (record.context?.rowData) {
      const rowData = record.context.rowData
      const priceField = Object.entries(rowData).find(
        ([key]) =>
          key.toLowerCase().includes("price") ||
          key.toLowerCase().includes("cost") ||
          key.toLowerCase().includes("amount"),
      )

      if (priceField) {
        const potentialPrice = Number.parseFloat(String(priceField[1]))
        if (!isNaN(potentialPrice)) {
          setPrice(potentialPrice)
        }
      }
    }
  }

  // Handle adding the item
  const handleAddItem = () => {
    // Validate form
    if (!description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a description for the item",
        variant: "destructive",
      })
      return
    }

    if (quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Quantity must be greater than zero",
        variant: "destructive",
      })
      return
    }

    // Create the new item
    const newItem = {
      description,
      quantity,
      unit,
      price,
      total: price * quantity,
    }

    // Add the item to the quotation
    onAddItem(newItem)

    // Reset form and close modal
    resetForm()
    onClose()
  }

  // Reset the form
  const resetForm = () => {
    setDescription("")
    setQuantity(1)
    setUnit("Each")
    setPrice(0)
    setSelectedRecord(null)
    setSearchTerm("")
    setSearchResults([])
  }

  // Handle key press for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a new item to your quotation by searching for records or entering details manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="search">Search Records</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter item description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Each, Hour, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (Base Price)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Note: The price entered is the base price before markup. The markup will be applied at the subtotal
                level.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for records..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Search
              </Button>
            </div>

            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 text-sm font-medium">Search Results ({searchResults.length})</div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {searchResults.map((record) => (
                    <div
                      key={record.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer ${
                        selectedRecord?.id === record.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSelectRecord(record)}
                    >
                      <div className="font-medium">
                        {record.fieldName}: {record.fieldValue}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.fileName} ({record.fileType.toUpperCase()})
                        {record.sheetOrNode ? ` • ${record.sheetOrNode}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No records found</p>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">Enter a search term to find records</p>
              </div>
            )}

            {selectedRecord && (
              <div className="border rounded-md p-4 bg-muted/30">
                <h4 className="font-medium mb-2">Selected Record</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-description">Description</Label>
                    <Input
                      id="search-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-quantity">Quantity</Label>
                      <Input
                        id="search-quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="search-unit">Unit</Label>
                      <Input id="search-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="search-price">Price (Base Price)</Label>
                      <Input
                        id="search-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddItem}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
