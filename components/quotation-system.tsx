"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Building2, Search, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { QuotationEditor } from "./quotation-editor"
import { QuotationPreview } from "./quotation-preview"
import { CompanyDataEditor } from "./company-data-editor"
import { SearchInterface } from "./search-interface"
import { DiagnosticsPanel } from "./diagnostics-panel"

interface QuotationSystemProps {
  records?: any[]
  onRecordsImported?: (records: any[]) => void
}

export function QuotationSystem({ records = [], onRecordsImported }: QuotationSystemProps) {
  const [activeTab, setActiveTab] = useState("search")
  const [quotationData, setQuotationData] = useState({
    companyInfo: {
      name: "Your Company Name",
      address: "123 Business Street",
      city: "Business City",
      state: "State",
      zipCode: "12345",
      phone: "(555) 123-4567",
      email: "info@yourcompany.com",
      website: "www.yourcompany.com",
    },
    clientInfo: {
      name: "Client Company",
      address: "456 Client Avenue",
      city: "Client City",
      state: "State",
      zipCode: "67890",
      phone: "(555) 987-6543",
      email: "contact@client.com",
    },
    quotationDetails: {
      quotationNumber: `QUO-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      terms: "Payment due within 30 days",
      notes: "Thank you for your business!",
    },
    lineItems: [] as any[],
  })

  const [showCompanyEditor, setShowCompanyEditor] = useState(false)
  const [importedRecords, setImportedRecords] = useState<any[]>(records)

  useEffect(() => {
    if (records && records.length > 0) {
      setImportedRecords(records)
      // Auto-navigate to edit tab when records are imported
      setActiveTab("edit")
      toast({
        title: "Records Imported",
        description: `Successfully imported ${records.length} records for quotation generation.`,
      })
    }
  }, [records])

  const handleRecordsImported = (newRecords: any[]) => {
    setImportedRecords(newRecords)
    setActiveTab("edit")
    onRecordsImported?.(newRecords)
    toast({
      title: "Records Imported",
      description: `Successfully imported ${newRecords.length} records.`,
    })
  }

  const handleQuotationUpdate = (updatedData: any) => {
    setQuotationData(updatedData)
  }

  const handleCompanyInfoUpdate = (companyInfo: any) => {
    setQuotationData((prev) => ({
      ...prev,
      companyInfo,
    }))
    setShowCompanyEditor(false)
    toast({
      title: "Company Information Updated",
      description: "Your company details have been saved successfully.",
    })
  }

  const exportToPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Your quotation is being prepared for download...",
    })
    // PDF export logic would go here
  }

  const getTotalAmount = () => {
    return quotationData.lineItems.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  const getItemCount = () => {
    return quotationData.lineItems.length
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotation System</h1>
          <p className="text-muted-foreground">Create professional quotations from your document data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {getItemCount()} items
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />${getTotalAmount().toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Import
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Edit Quotation
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Document Search & Import
              </CardTitle>
              <CardDescription>
                Search through your uploaded documents and import data for quotation generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchInterface onRecordsImported={handleRecordsImported} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Edit Quotation</h2>
              <p className="text-muted-foreground">Configure your quotation details and line items</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowCompanyEditor(true)} className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Info
              </Button>
              <Button onClick={() => setActiveTab("preview")} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          <QuotationEditor
            quotationData={quotationData}
            onQuotationUpdate={handleQuotationUpdate}
            importedRecords={importedRecords}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Quotation Preview</h2>
              <p className="text-muted-foreground">Review your quotation before sending to client</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setActiveTab("edit")} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Edit
              </Button>
              <Button onClick={exportToPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <QuotationPreview quotationData={quotationData} />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Diagnostics
              </CardTitle>
              <CardDescription>Monitor system performance and data extraction quality</CardDescription>
            </CardHeader>
            <CardContent>
              <DiagnosticsPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company Data Editor Modal */}
      {showCompanyEditor && (
        <CompanyDataEditor
          companyInfo={quotationData.companyInfo}
          onSave={handleCompanyInfoUpdate}
          onCancel={() => setShowCompanyEditor(false)}
        />
      )}
    </div>
  )
}
