"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, AlertTriangle, Quote, Download, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { FileRecord } from "@/lib/types"

interface RecordContext {
  rowData?: any
  xmlNode?: string
  warning?: string
}

interface RecordPreviewModalProps {
  record: FileRecord
  isOpen: boolean
  onClose: () => void
}

export function RecordPreviewModal({ record, isOpen, onClose }: RecordPreviewModalProps) {
  const [context, setContext] = useState<RecordContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("context")
  const [exportLoading, setExportLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchRecordContext()
    }
  }, [isOpen, record.id])

  const fetchRecordContext = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/records/${record.id}/context`)
      const data = await response.json()
      setContext(data)
    } catch (error) {
      console.error("Failed to fetch record context:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportQuotation = async () => {
    try {
      setExportLoading(true)

      // Dynamically import the quotation generator
      const { generateQuotationPdf } = await import("@/lib/quotation-generator")

      // Generate quotation PDF with just this record and its context
      await generateQuotationPdf([record], { [record.id]: context }, "Single Record Quotation")

      toast({
        title: "Quotation exported",
        description: "Record quotation exported to PDF",
      })
    } catch (error) {
      console.error("Error exporting quotation:", error)
      toast({
        title: "Export failed",
        description: "There was an error creating the quotation PDF",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Update the handleCreateQuotation function to include context data
  const handleCreateQuotation = () => {
    // Store the record with context in localStorage for the quotation system to use
    const recordWithContext = {
      ...record,
      context: context,
    }

    localStorage.setItem("quotationRecords", JSON.stringify([recordWithContext]))
    console.log("Sending 1 record with context to quotation system from modal")

    // Close the modal
    onClose()

    // Navigate to the quotation tab
    window.location.href = "/?tab=quotation"

    toast({
      title: "Record sent to Quotation",
      description: "Record sent to the Quotation System with context data",
    })
  }

  // Fix the jsPDF import issue
  const handleExportContext = async () => {
    try {
      setExportLoading(true)

      // Dynamically import jsPDF
      const jsPDFModule = await import("jspdf")
      // Fix the jsPDF constructor access
      const jsPDF = jsPDFModule.default

      // Create a new PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(16)
      doc.text(`Record Context: ${record.fieldName} = ${record.fieldValue}`, 14, 20)

      // Add metadata
      doc.setFontSize(10)
      doc.text(`File: ${record.fileName} (${record.fileType.toUpperCase()})`, 14, 30)
      doc.text(`Sheet/Node: ${record.sheetOrNode}`, 14, 35)
      doc.text(`Location: ${record.rowNum ? `Row ${record.rowNum}` : record.fullPath}`, 14, 40)

      // Add context data
      doc.setFontSize(12)
      doc.text("Context Data:", 14, 50)

      let yPos = 60

      if (record.fileType.toLowerCase() === "xml" && context?.xmlNode) {
        // For XML, add a formatted version of the XML
        const xmlLines = context.xmlNode.replace(/</g, "&lt;").replace(/>/g, "&gt;").split("\n")

        doc.setFont("courier", "normal")
        doc.setFontSize(8)

        // Add type annotation for line parameter
        xmlLines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos)
          yPos += 5
        })
      } else if (context?.rowData) {
        // For spreadsheets, add a table of the row data
        doc.setFontSize(10)

        Object.entries(context.rowData).forEach(([key, value], index) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }

          const isHighlighted = key === record.fieldName

          if (isHighlighted) {
            doc.setTextColor(200, 0, 0)
          }

          doc.text(key, 14, yPos)
          doc.text(value !== null && value !== undefined ? String(value) : "", 80, yPos)

          if (isHighlighted) {
            doc.setTextColor(0, 0, 0)
          }

          yPos += 7
        })
      }

      // Add page numbers
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10)
      }

      doc.save(`record-context-${record.id}.pdf`)

      toast({
        title: "Context exported",
        description: "Record context exported to PDF",
      })
    } catch (error) {
      console.error("Error exporting context:", error)
      toast({
        title: "Export failed",
        description: "There was an error creating the context PDF",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const renderExcelPreview = () => {
    if (!context?.rowData) {
      return <p>No row data available</p>
    }

    return (
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border px-4 py-2 text-left text-sm font-medium">Field</th>
              <th className="border px-4 py-2 text-left text-sm font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(context.rowData).map(([key, value], index) => (
              <tr
                key={index}
                className={`border-b hover:bg-muted/50 ${key === record.fieldName ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}
              >
                <td className="border px-4 py-2 text-sm font-medium">{key}</td>
                <td className="border px-4 py-2 text-sm">
                  {value !== null && value !== undefined ? String(value) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderXmlPreview = () => {
    if (!context?.xmlNode) {
      return <p>No XML data available</p>
    }

    // Simple XML formatting with syntax highlighting and highlighting the field
    const fieldName = record.fieldName
    const fieldValue = record.fieldValue

    let formattedXml = context.xmlNode
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /&lt;(\/?[a-z0-9_:-]+)(?:\s+[^>]*)?&gt;/gi,
        "<span class='text-blue-600'>&lt;$1</span>$2<span class='text-blue-600'>&gt;</span>",
      )
      .replace(/&lt;!\[CDATA\[(.*?)\]\]&gt;/g, "<span class='text-gray-500'>&lt;![CDATA[$1]]&gt;</span>")
      .replace(/&lt;!--(.*?)--&gt;/g, "<span class='text-gray-500'>&lt;!--$1--&gt;</span>")
      .replace(/\s+class='([^']*?)'/g, ' class="$1"')

    // Highlight the field name and value
    if (fieldName && fieldValue) {
      const fieldRegex = new RegExp(`(&lt;${fieldName}&gt;)(.*?)(&lt;\\/${fieldName}&gt;)`, "g")
      formattedXml = formattedXml.replace(
        fieldRegex,
        `<span class='bg-yellow-100 dark:bg-yellow-900/30 rounded px-1'>$1$2$3</span>`,
      )
    }

    return (
      <div className="overflow-auto max-h-[60vh] bg-muted/30 p-4 rounded">
        <pre className="text-sm font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedXml }} />
      </div>
    )
  }

  const renderQuotationPreview = () => {
    if (!context) {
      return <p>No context data available</p>
    }

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">Document Quotation</h3>
              <p className="text-sm text-muted-foreground">
                Quotation #: Q-{new Date().getFullYear()}-
                {Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">
                Valid until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Record Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="font-medium">File:</div>
              <div>
                {record.fileName} ({record.fileType.toUpperCase()})
              </div>
              <div className="font-medium">Sheet/Node:</div>
              <div>{record.sheetOrNode}</div>
              <div className="font-medium">Field Name:</div>
              <div>{record.fieldName}</div>
              <div className="font-medium">Field Value:</div>
              <div>{record.fieldValue}</div>
              <div className="font-medium">Location:</div>
              <div>{record.rowNum ? `Row ${record.rowNum}` : record.fullPath}</div>
            </div>
          </div>

          {record.fileType.toLowerCase() === "xml" ? (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">XML Context</h4>
              <div className="bg-muted/30 p-4 rounded overflow-auto max-h-[300px]">
                <pre
                  className="text-sm font-mono whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: context.xmlNode
                      ? context.xmlNode.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                      : "No XML data available",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Row Data</h4>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border px-4 py-2 text-left text-sm font-medium">Field</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {context.rowData ? (
                      Object.entries(context.rowData).map(([key, value], index) => (
                        <tr
                          key={index}
                          className={`border-b hover:bg-muted/50 ${key === record.fieldName ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}
                        >
                          <td className="border px-4 py-2 text-sm font-medium">{key}</td>
                          <td className="border px-4 py-2 text-sm">
                            {value !== null && value !== undefined ? String(value) : ""}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="border px-4 py-2 text-center text-sm">
                          No row data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCreateQuotation} disabled={exportLoading} className="gap-2">
            <FileText className="h-4 w-4" />
            Create Quotation
          </Button>
          <Button onClick={handleExportQuotation} disabled={exportLoading} className="gap-2">
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Quote className="h-4 w-4" />}
            Export Quotation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl" aria-describedby="record-preview-description">
        <DialogHeader>
          <DialogTitle>
            Record Preview: {record.fieldName} = {record.fieldValue}
          </DialogTitle>
          <DialogDescription id="record-preview-description">
            Detailed view of the selected record and its context
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-4">
            {context?.warning && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{context.warning}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File:</p>
                <p className="text-sm">{record.fileName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type:</p>
                <p className="text-sm">{record.fileType.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sheet/Node:</p>
                <p className="text-sm">{record.sheetOrNode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{record.rowNum ? "Row Number:" : "Path:"}</p>
                <p className="text-sm">{record.rowNum ? record.rowNum : record.fullPath}</p>
              </div>
            </div>

            <Tabs defaultValue="context" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="quotation">Quotation Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="context" className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Context</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportContext}
                    disabled={exportLoading}
                    className="gap-2"
                  >
                    {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export Context
                  </Button>
                </div>
                <div className="overflow-auto max-h-[60vh]">
                  {record.fileType.toLowerCase() === "xml" ? renderXmlPreview() : renderExcelPreview()}
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="border-t pt-4">
                {renderQuotationPreview()}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
