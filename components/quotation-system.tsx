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
    let description = `${record.fieldName}: ${record.fieldValue}`
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

    // If we have context data, enhance the description
    if (record.context) {
      if (record.fileType.toLowerCase() === "xml" && record.context.xmlNode) {
        // For XML records, add a simplified XML context
        const xmlPreview = record.context.xmlNode
          .replace(/</g, "")
          .replace(/>/g, "")
          .replace(/\s+/g, " ")
          .substring(0, 100)

        if (xmlPreview) {
          description += `\nXML Context: ${xmlPreview}${xmlPreview.length >= 100 ? "..." : ""}`
        }
      } else if (record.context.rowData) {
        // For spreadsheet records, add key row data
        const rowData = record.context.rowData
        const relevantFields = Object.entries(rowData)
          .filter(([key]) => key !== record.fieldName) // Exclude the field we already have
          .slice(0, 3) // Take up to 3 additional fields

        if (relevantFields.length > 0) {
          description += "\nAdditional data:"
          relevantFields.forEach(([key, value]) => {
            description += `\n- ${key}: ${value}`
          })
        }

        // Try to find a price field in the row data - enhanced logic
        const priceField = Object.entries(rowData).find(([key]) => {
          const lowerKey = key.toLowerCase().trim()
          return (
            lowerKey === "price excl" ||
            lowerKey === "price" ||
            lowerKey === "selling" ||
            lowerKey.includes("price") ||
            lowerKey.includes("cost") ||
            lowerKey.includes("amount")
          )
        })

        if (priceField) {
          const potentialPrice = Number.parseFloat(String(priceField[1]))
          if (!isNaN(potentialPrice)) {
            price = potentialPrice
          }
        }
      }
    }

    return {
      id: `item-${Date.now()}-${index}`,
      no: index + 1,
      description: description,
      quantity: 1,
      unit: "Each",
      price: price,
      total: price, // Will be calculated when price is set
    }
  })
}

export function QuotationSystem() {
  const [quotationData, setQuotationData] = useState<QuotationData>(initialQuotationData)
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData)
  const [activeTab, setActiveTab] = useState("edit")
  const [showCompanyEditor, setShowCompanyEditor] = useState(false)
  const [isIntelligentMode, setIsIntelligentMode] = useState(true)
  const { toast } = useToast()

  // Update the useEffect to use the enhanced convertRecordsToLineItems function
  useEffect(() => {
    // Check if there are records from the Document Indexer
    const storedRecords = localStorage.getItem("quotationRecords")
    console.log("Checking for stored records:", storedRecords ? "Found" : "None")

    if (storedRecords) {
      try {
        const records = JSON.parse(storedRecords) as FileRecord[]
        console.log(`Found ${records.length} records in localStorage`)

        if (records.length > 0) {
          // Convert records to line items using intelligent extraction
          const newLineItems = convertRecordsToLineItems(records)
          console.log(`Converted to ${newLineItems.length} line items`)

          // Calculate totals
          const subtotal = newLineItems.reduce((sum, item) => sum + item.total, 0)
          const markupAmount = subtotal * (quotationData.markupRate / 100)
          const totalAmount = subtotal + markupAmount

          // Create a new quotation with these line items
          const newQuotationData = {
            ...quotationData,
            lineItems: newLineItems,
            subtotal,
            markupAmount,
            totalAmount,
          }

          setQuotationData(newQuotationData)
          setActiveTab("preview") // Navigate to preview tab when creating quotation

          // Clear the stored records to avoid reloading them on refresh
          localStorage.removeItem("quotationRecords")

          // Check if we used intelligent extraction
          const hasStructuredData = newLineItems.some((item) => item.specs && Object.keys(item.specs).length > 0)

          toast({
            title: hasStructuredData ? "Smart Import Complete!" : "Records Imported",
            description: hasStructuredData
              ? `${records.length} records intelligently processed with technical specifications`
              : `${records.length} records imported from Document Indexer with context data`,
          })
        }
      } catch (error) {
        console.error("Error parsing stored records:", error)
        toast({
          title: "Import Error",
          description: "There was an error importing records from the Document Indexer",
          variant: "destructive",
        })
      }
    }
  }, [])

  const handleUpdateQuotation = (data: QuotationData) => {
    setQuotationData(data)
  }

  const handleUpdateCompanyData = (data: CompanyData) => {
    setCompanyData(data)
    setShowCompanyEditor(false)
  }

  const handleReorderLineItems = (reorderedItems: LineItem[]) => {
    setQuotationData({
      ...quotationData,
      lineItems: reorderedItems,
    })
  }

  const handleExportPdf = async () => {
    const element = document.getElementById("quotation-preview")
    if (!element) return

    try {
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your quotation PDF...",
      })

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")

      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Quotation-${quotationData.documentNumber}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Your quotation has been exported as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Quotation System</h1>
          {isIntelligentMode && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <Zap className="h-3 w-3" />
              Smart Mode
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Create, edit and export professional sales quotations with intelligent specification extraction
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="edit">Edit Quotation</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => setShowCompanyEditor(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Company Data
            </Button>
            <Button variant="default" size="sm" onClick={handleExportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <TabsContent value="edit" className="mt-0">
          <QuotationEditor
            quotationData={quotationData}
            onUpdateQuotation={handleUpdateQuotation}
            onReorderLineItems={handleReorderLineItems}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <QuotationPreview quotationData={quotationData} companyData={companyData} />
        </TabsContent>
      </Tabs>

      {showCompanyEditor && (
        <CompanyDataEditor
          companyData={companyData}
          onUpdateCompanyData={handleUpdateCompanyData}
          onCancel={() => setShowCompanyEditor(false)}
        />
      )}
    </div>
  )
}
