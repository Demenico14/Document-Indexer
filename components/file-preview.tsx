"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { File, AlertTriangle, Download, Quote, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { FileRecord } from "@/lib/types"

export function FilePreview() {
  const [activeTab, setActiveTab] = useState("placeholder")
  const [selectedRecords, setSelectedRecords] = useState<FileRecord[]>([])
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [recordContexts, setRecordContexts] = useState<Record<string, any>>({})
  const [loadingContexts, setLoadingContexts] = useState<Set<string>>(new Set())
  const [exportLoading, setExportLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load selected records from localStorage
    const storedRecords = localStorage.getItem("selectedRecordsData")
    if (storedRecords) {
      try {
        const parsedRecords = JSON.parse(storedRecords) as FileRecord[]
        setSelectedRecords(parsedRecords)
        setActiveTab("selected")
      } catch (error) {
        console.error("Error parsing stored records:", error)
      }
    }
  }, [])

  const handleClearSelected = () => {
    setSelectedRecords([])
    setRecordContexts({})
    setExpandedRecords(new Set())
    localStorage.removeItem("selectedRecords")
    localStorage.removeItem("selectedRecordsData")
    setActiveTab("placeholder")
    toast({
      title: "Cleared",
      description: "Selected records have been cleared",
    })
  }

  const handleExportSelected = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select records from the Search tab first",
        variant: "destructive",
      })
      return
    }

    try {
      // Import the PDF generator dynamically to avoid SSR issues
      const { generatePdf } = await import("@/lib/pdf-generator")
      await generatePdf(selectedRecords, "Selected Records")

      toast({
        title: "Export successful",
        description: `${selectedRecords.length} records exported to PDF`,
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting to PDF",
        variant: "destructive",
      })
    }
  }

  // Update the handleCreateQuotation function to include context data
  const handleCreateQuotation = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select records from the Search tab first",
        variant: "destructive",
      })
      return
    }

    try {
      // Show loading toast
      toast({
        title: "Preparing quotation data",
        description: "Fetching context data for selected records...",
      })

      // Ensure we have context for all records
      for (const record of selectedRecords) {
        if (!recordContexts[record.id]) {
          await fetchRecordContext(record.id)
        }
      }

      // Create records with context
      const recordsWithContext = selectedRecords.map((record) => ({
        ...record,
        context: recordContexts[record.id],
      }))

      // Store the selected records in localStorage for the quotation system to use
      localStorage.setItem("quotationRecords", JSON.stringify(recordsWithContext))

      // Log for debugging
      console.log(`Sending ${recordsWithContext.length} records with context to quotation system from preview`)

      // Navigate to the quotation tab
      window.location.href = "/?tab=quotation"

      toast({
        title: "Records sent to Quotation",
        description: `${recordsWithContext.length} records sent to the Quotation System with context data`,
      })
    } catch (error) {
      console.error("Error preparing quotation data:", error)
      toast({
        title: "Error",
        description: "Failed to prepare quotation data",
        variant: "destructive",
      })
    }
  }

  const handleExportQuotation = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select records from the Search tab first",
        variant: "destructive",
      })
      return
    }

    try {
      setExportLoading(true)

      // Ensure we have context for all records
      await Promise.all(
        selectedRecords.filter((record) => !recordContexts[record.id]).map((record) => fetchRecordContext(record.id)),
      )

      // Import the quotation generator dynamically
      const { generateQuotationPdf } = await import("@/lib/quotation-generator")

      // Generate quotation PDF with records and their contexts
      await generateQuotationPdf(selectedRecords, recordContexts, "Document Quotation")

      toast({
        title: "Quotation exported",
        description: `Quotation with ${selectedRecords.length} records exported to PDF`,
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

  const toggleRecordExpansion = async (recordId: string) => {
    const newExpandedRecords = new Set(expandedRecords)

    if (newExpandedRecords.has(recordId)) {
      newExpandedRecords.delete(recordId)
    } else {
      newExpandedRecords.add(recordId)
      // Fetch context if we don't have it yet
      if (!recordContexts[recordId]) {
        await fetchRecordContext(recordId)
      }
    }

    setExpandedRecords(newExpandedRecords)
  }

  const fetchRecordContext = async (recordId: string) => {
    if (loadingContexts.has(recordId) || recordContexts[recordId]) return

    try {
      setLoadingContexts((prev) => new Set(prev).add(recordId))

      const response = await fetch(`/api/records/${recordId}/context`)
      const data = await response.json()

      setRecordContexts((prev) => ({
        ...prev,
        [recordId]: data,
      }))
    } catch (error) {
      console.error("Failed to fetch record context:", error)
      toast({
        title: "Error",
        description: "Failed to load record details",
        variant: "destructive",
      })
    } finally {
      setLoadingContexts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(recordId)
        return newSet
      })
    }
  }

  const handleExportSingleContext = async (recordId: string) => {
    if (!recordContexts[recordId]) return

    const record = selectedRecords.find((r) => r.id === recordId)
    if (!record) return

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

      if (record.fileType.toLowerCase() === "xml" && recordContexts[recordId]?.xmlNode) {
        // For XML, add a formatted version of the XML
        const xmlLines = recordContexts[recordId].xmlNode.replace(/</g, "&lt;").replace(/>/g, "&gt;").split("\n")

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
      } else if (recordContexts[recordId]?.rowData) {
        // For spreadsheets, add a table of the row data
        doc.setFontSize(10)

        Object.entries(recordContexts[recordId].rowData).forEach(([key, value], index) => {
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

  const renderSelectedRecords = () => {
    if (selectedRecords.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
          <p className="text-muted-foreground">No records selected</p>
          <p className="text-sm text-muted-foreground mt-2">
            Go to the Search tab, search for records, and select the ones you want to preview
          </p>
        </div>
      )
    }

    // Group records by sheet/node for better organization
    const recordsBySheet: Record<string, FileRecord[]> = {}
    selectedRecords.forEach((record) => {
      const sheetName = record.sheetOrNode || "Unknown"
      if (!recordsBySheet[sheetName]) {
        recordsBySheet[sheetName] = []
      }
      recordsBySheet[sheetName].push(record)
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {selectedRecords.length} selected records from {Object.keys(recordsBySheet).length} sheets/nodes
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearSelected}>
              Clear Selected
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateQuotation} disabled={selectedRecords.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
            <Button variant="default" size="sm" onClick={handleExportQuotation} disabled={exportLoading}>
              <Quote className="h-4 w-4 mr-2" />
              {exportLoading ? "Generating..." : "Generate Quotation"}
            </Button>
          </div>
        </div>

        {Object.entries(recordsBySheet).map(([sheetName, records]) => (
          <div key={sheetName} className="border rounded-lg overflow-hidden mb-6">
            <div className="bg-muted px-4 py-2 font-medium">
              Sheet/Node: {sheetName} ({records.length} records)
            </div>
            <div className="divide-y">
              {records.map((record: FileRecord) => (
                <div key={record.id} className="p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium">{record.fieldName}</div>
                      <div className="text-sm">{record.fieldValue}</div>
                      <div className="text-xs text-muted-foreground">
                        {record.fileName} ({record.fileType.toUpperCase()}) •
                        {record.rowNum ? ` Row ${record.rowNum}` : record.fullPath}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleRecordExpansion(record.id)} className="ml-2">
                      {expandedRecords.has(record.id) ? "Hide Details" : "Show Details"}
                    </Button>
                  </div>

                  {expandedRecords.has(record.id) && (
                    <div className="mt-4 pt-4 border-t">
                      {loadingContexts.has(record.id) ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : recordContexts[record.id] ? (
                        <div className="bg-muted/30 rounded-md p-4">
                          {record.fileType.toLowerCase() === "xml" ? (
                            <div className="font-mono text-xs overflow-x-auto max-h-[300px] overflow-y-auto">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: recordContexts[record.id].xmlNode || "No XML data available",
                                }}
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium">Row Data:</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExportSingleContext(record.id)}
                                  className="h-7 text-xs"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Export
                                </Button>
                              </div>
                              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                  <thead className="sticky top-0 bg-background">
                                    <tr className="bg-muted">
                                      <th className="px-3 py-2 text-left font-medium">Field</th>
                                      <th className="px-3 py-2 text-left font-medium">Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {recordContexts[record.id].rowData ? (
                                      Object.entries(recordContexts[record.id].rowData).map(([key, value], idx) => (
                                        <tr
                                          key={idx}
                                          className={`border-b ${key === record.fieldName ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}
                                        >
                                          <td className="px-3 py-2 font-medium">{key}</td>
                                          <td className="px-3 py-2">
                                            {value !== null && value !== undefined ? String(value) : ""}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={2} className="px-3 py-2 text-center text-muted-foreground">
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
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">Failed to load record details</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Preview</CardTitle>
        <CardDescription>Preview selected records from your search results</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={selectedRecords.length > 0 ? "selected" : "placeholder"}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="placeholder">Placeholder</TabsTrigger>
            <TabsTrigger value="selected">Selected Records</TabsTrigger>
          </TabsList>

          <TabsContent value="placeholder" className="min-h-[300px]">
            <div className="flex flex-col items-center justify-center h-[300px] border border-dashed rounded-lg p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <File className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No records selected</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Go to the Search tab, search for records, and select the ones you want to preview
              </p>
            </div>
          </TabsContent>

          <TabsContent value="selected" className="min-h-[300px]">
            {renderSelectedRecords()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
