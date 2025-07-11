"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Save, X } from "lucide-react"
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

  const handleSave = () => {
    onUpdateCompanyData(editingData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription className="text-blue-100">Update your company details for quotations</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Company Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={editingData.name}
              onChange={handleInputChange}
              placeholder="Enter your company name"
              className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
              Address *
            </Label>
            <Textarea
              id="address"
              name="address"
              value={editingData.address}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter your complete business address"
              className="border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={editingData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editingData.email}
                onChange={handleInputChange}
                placeholder="info@company.com"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                Website
              </Label>
              <Input
                id="website"
                name="website"
                value={editingData.website}
                onChange={handleInputChange}
                placeholder="www.company.com"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber" className="text-sm font-semibold text-gray-700">
                VAT Number
              </Label>
              <Input
                id="vatNumber"
                name="vatNumber"
                value={editingData.vatNumber}
                onChange={handleInputChange}
                placeholder="GB123456789"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-sm font-semibold text-gray-700">
                Registration Number
              </Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={editingData.registrationNumber}
                onChange={handleInputChange}
                placeholder="Company registration number"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin" className="text-sm font-semibold text-gray-700">
                Tax Identification Number
              </Label>
              <Input
                id="tin"
                name="tin"
                value={editingData.tin}
                onChange={handleInputChange}
                placeholder="Tax ID number"
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
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
              rows={4}
              placeholder="Enter your bank account details for payments"
              className="border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
