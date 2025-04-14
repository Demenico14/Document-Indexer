"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, Download, Code } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { FileRecord } from "@/lib/types"

export function XmlPreview() {
  const [activeTab, setActiveTab] = useState("placeholder")
  const [selectedRecords, setSelectedRecords] = useState<FileRecord[]>([])
  const [xmlContent, setXmlContent] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    // Load selected records from localStorage
    const storedRecords = localStorage.getItem("selectedRecordsData")
    if (storedRecords) {
      try {
        const parsedRecords = JSON.parse(storedRecords) as FileRecord[]
        // Filter only XML records
        const xmlRecords = parsedRecords.filter((record) => record.fileType.toLowerCase() === "xml")

        setSelectedRecords(xmlRecords)

        if (xmlRecords.length > 0) {
          setActiveTab("selected")

          // For demonstration, we'll create a simple XML representation
          const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<records>
${xmlRecords
  .map(
    (record) => `  <record>
    <field name="${escapeXml(record.fieldName)}">${escapeXml(record.fieldValue)}</field>
    <file>${escapeXml(record.fileName)}</file>
    <path>${record.fullPath ? escapeXml(record.fullPath) : ""}</path>
  </record>`,
  )
  .join("\n")}
</records>`

          setXmlContent(xmlSample)
        }
      } catch (error) {
        console.error("Error parsing stored records:", error)
      }
    }
  }, [])

  // Helper function to escape XML special characters
  const escapeXml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  const handleClearSelected = () => {
    setSelectedRecords([])
    setXmlContent("")
    localStorage.removeItem("selectedXmlRecords")
    setActiveTab("placeholder")
    toast({
      title: "Cleared",
      description: "Selected XML records have been cleared",
    })
  }

  const handleExportXml = () => {
    if (xmlContent.length === 0) {
      toast({
        title: "No XML content",
        description: "There is no XML content to export",
        variant: "destructive",
      })
      return
    }

    // Create a blob and download it
    const blob = new Blob([xmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exported-records.xml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: "XML content has been exported",
    })
  }

  const renderSelectedRecords = () => {
    if (selectedRecords.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
          <p className="text-muted-foreground">No XML records selected</p>
          <p className="text-sm text-muted-foreground mt-2">
            Go to the Search tab, search for XML records, and select the ones you want to preview
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Showing {selectedRecords.length} selected XML records</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearSelected}>
              Clear Selected
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportXml}>
              <Download className="h-4 w-4 mr-2" />
              Export XML
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-medium flex items-center">
            <Code className="h-4 w-4 mr-2" />
            XML Preview
          </div>
          <div className="overflow-x-auto">
            <pre className="p-4 text-sm bg-muted/30 overflow-auto max-h-[60vh] whitespace-pre-wrap">{xmlContent}</pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>XML Preview</CardTitle>
        <CardDescription>Preview selected XML records from your search results</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={selectedRecords.length > 0 ? "selected" : "placeholder"}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="placeholder">Placeholder</TabsTrigger>
            <TabsTrigger value="selected">Selected XML Records</TabsTrigger>
          </TabsList>

          <TabsContent value="placeholder" className="min-h-[300px]">
            <div className="flex flex-col items-center justify-center h-[300px] border border-dashed rounded-lg p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No XML records selected</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Go to the Search tab, search for XML records, and select the ones you want to preview
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
