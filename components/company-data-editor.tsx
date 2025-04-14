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
import { Upload } from "lucide-react"
import type { CompanyData } from "@/lib/types"

interface CompanyDataEditorProps {
  companyData: CompanyData
  onUpdateCompanyData: (data: CompanyData) => void
  onCancel: () => void
}

export function CompanyDataEditor({ companyData, onUpdateCompanyData, onCancel }: CompanyDataEditorProps) {
  const [editingData, setEditingData] = useState<CompanyData>(companyData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditingData({
      ...editingData,
      [name]: value,
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditingData({
          ...editingData,
          logo: event.target.result as string,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onUpdateCompanyData(editingData)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Company Information</DialogTitle>
          <DialogDescription>Update your company details that appear on quotations</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" value={editingData.name} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={editingData.address} onChange={handleInputChange} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={editingData.phone} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={editingData.email} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              {editingData.logo && (
                <img
                  src={editingData.logo || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-12 w-auto object-contain"
                />
              )}
              <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
