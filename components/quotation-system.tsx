"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuotationEditor } from "@/components/quotation-editor"
import { QuotationPreview } from "@/components/quotation-preview"
import { CompanyDataEditor } from "@/components/company-data-editor"
import { Button } from "@/components/ui/button"
import { Download, FileText, Settings, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { initialQuotationData, initialCompanyData } from "@/lib/initial-data"
import { extractTechSpecs, createStructuredLineItems } from "@/lib/tech-spec-extractor"
import type { QuotationData, CompanyData, LineItem, FileRecord } from "@/lib/types"

// Update the convertRecordsToLineItems function to use intelligent extraction
function convertRecordsToLineItems(records: FileRecord[]) {
  // First, try to extract structured technical specifications
  const extractedProducts = extractTechSpecs(records)

  if (extractedProducts.length > 0) {
    console.log("Extracted structured products:", extractedProducts)
    return createStructuredLineItems(extractedProducts)
  }

  // Fallback to the original method if no structured data found
  return records.map((record, index) => {
    // Create a description based on the record and its context
    const description = `${record.fieldName}: ${record.fieldValue}`
    let price = 0

    // Check if the current record itself contains price information
    if (record.fieldName) {
      const fieldNameLower = record.fieldName.toLowerCase().trim()
      if (
        fieldNameLower === "price excl" ||
        fieldNameLower === "price" ||
        fieldNameLower === "selling" ||
        fieldNameLower.includes("price") ||
        fieldNameLower.includes("cost") ||
        fieldNameLower.includes("amount")
      ) {
        const potentialPrice = Number.parseFloat(String(record.fieldValue))
        if (!isNaN(potentialPrice)) {
          price = potentialPrice
        }
      }
    }

    return {
      id: `item-${Date.now()}-${index}`,
      no: index + 1,
      description,
      quantity: 1,
      unit: "Each",
      price,
      total: price,
    }
  })
}

interface QuotationSystemProps {
  records: FileRecord[]
  onRecordsUpdate?: (records: FileRecord[]) => void
}

export function QuotationSystem({ records, onRecordsUpdate }: QuotationSystemProps) {
  const [quotationData, setQuotationData] = useState<QuotationData>(initialQuotationData)
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData)
  const [activeTab, setActiveTab] = useState("editor")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const { toast } = useToast()

  // Auto-generate line items when records change
  useEffect(() => {
    if (records && records.length > 0) {
      const lineItems = convertRecordsToLineItems(records)
      setQuotationData((prev) => ({
        ...prev,
        lineItems,
      }))
    }
  }, [records])

  const handleQuotationUpdate = (updatedData: QuotationData) => {
    setQuotationData(updatedData)
  }

  const handleCompanyUpdate = (updatedData: CompanyData) => {
    setCompanyData(updatedData)
  }

  const handleReorderLineItems = (reorderedItems: LineItem[]) => {
    setQuotationData((prev) => ({
      ...prev,
      lineItems: reorderedItems,
    }))
  }

  const handleCreateQuotation = () => {
    // Navigate to quotation tab when create quotation is pressed
    setActiveTab("quotation")

    toast({
      title: "Quotation Created",
      description: "Your quotation has been generated and is ready for preview.",
    })
  }

  const generatePDF = async () => {
    setIsGeneratingPDF(true)

    try {
      const element = document.getElementById("quotation-preview")
      if (!element) {
        throw new Error("Quotation preview element not found")
      }

      // Create canvas from the quotation preview
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save the PDF
      const fileName = `Quotation-${quotationData.documentNumber || "Draft"}.pdf`
      pdf.save(fileName)

      toast({
        title: "PDF Generated",
        description: `Quotation has been saved as ${fileName}`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quotation Management System</h1>
          <p className="text-gray-600">Create, edit, and manage professional quotations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-auto grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="quotation" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quotation
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Company
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateQuotation}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                variant="outline"
                className="border-blue-200 hover:bg-blue-50 bg-transparent"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="editor" className="space-y-6">
            <QuotationEditor
              quotationData={quotationData}
              onUpdateQuotation={handleQuotationUpdate}
              onReorderLineItems={handleReorderLineItems}
            />
          </TabsContent>

          <TabsContent value="quotation" className="space-y-6">
            <QuotationPreview quotationData={quotationData} companyData={companyData} />
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <CompanyDataEditor companyData={companyData} onUpdateCompany={handleCompanyUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
