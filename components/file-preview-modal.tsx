"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface File {
  id: string
  filename: string
  fileType: string
  uploadedAt: string
  rowCount: number
  originalName: string
}

interface PreviewData {
  headers?: string[]
  rows?: any[][]
  xml?: string
  warning?: string
  sheets?: string[]
  currentSheet?: string
  hasImages?: boolean
}

interface FilePreviewModalProps {
  file: File
  isOpen: boolean
  onClose: () => void
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSheet, setCurrentSheet] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      fetchPreviewData()
    }
  }, [isOpen, file.id, currentSheet])

  const fetchPreviewData = async () => {
    try {
      setLoading(true)
      const url = currentSheet
        ? `/api/files/${file.id}/preview?sheet=${encodeURIComponent(currentSheet)}`
        : `/api/files/${file.id}/preview`
      const response = await fetch(url)
      const data = await response.json()

      // Set the current sheet if it's not already set
      if (data.sheets && data.sheets.length > 0 && !currentSheet) {
        setCurrentSheet(data.currentSheet || data.sheets[0])
      }

      setPreviewData(data)
    } catch (error) {
      console.error("Failed to fetch preview data:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderExcelPreview = () => {
    if (!previewData?.headers || !previewData?.rows) {
      return <p>No data available</p>
    }

    const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentSheet(e.target.value)
    }

    return (
      <div className="space-y-4">
        {previewData.sheets && previewData.sheets.length > 1 && (
          <div className="flex items-center space-x-2">
            <label htmlFor="sheet-selector" className="text-sm font-medium">
              Sheet:
            </label>
            <select
              id="sheet-selector"
              value={currentSheet || previewData.currentSheet}
              onChange={handleSheetChange}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {previewData.sheets.map((sheet) => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </div>
        )}

        {previewData.hasImages && (
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm">
            <p className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
              This Excel file contains images or embedded objects that cannot be displayed in the preview.
            </p>
          </div>
        )}

        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                {previewData.headers.map((header, index) => (
                  <th key={index} className="border px-4 py-2 text-left text-sm font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-muted/50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border px-4 py-2 text-sm">
                      {cell !== null && cell !== undefined ? String(cell) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderXmlPreview = () => {
    if (!previewData?.xml) {
      return <p>No XML data available</p>
    }

    // Simple XML formatting with syntax highlighting
    const formattedXml = previewData.xml
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /&lt;(\/?[a-z0-9_:-]+)(?:\s+[^>]*)?&gt;/gi,
        "<span class='text-blue-600'>&lt;$1</span>$2<span class='text-blue-600'>&gt;</span>",
      )
      .replace(/&lt;!\[CDATA\[(.*?)\]\]&gt;/g, "<span class='text-gray-500'>&lt;![CDATA[$1]]&gt;</span>")
      .replace(/&lt;!--(.*?)--&gt;/g, "<span class='text-gray-500'>&lt;!--$1--&gt;</span>")
      .replace(/\s+class='([^']*?)'/g, ' class="$1"')

    return (
      <div className="overflow-auto max-h-[60vh] bg-muted/30 p-4 rounded">
        <pre className="text-sm font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedXml }} />
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl" aria-describedby="file-preview-description">
        <DialogHeader>
          <DialogTitle>Preview: {file.originalName}</DialogTitle>
          <DialogDescription id="file-preview-description">Preview of file content and structure</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {previewData?.warning && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{previewData.warning}</AlertDescription>
              </Alert>
            )}

            {file.fileType.toLowerCase() === "xml" ? (
              renderXmlPreview()
            ) : (
              <Tabs defaultValue="table">
                <TabsList className="mb-4">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                <TabsContent value="table">{renderExcelPreview()}</TabsContent>
                <TabsContent value="raw">
                  <div className="overflow-auto max-h-[60vh] bg-muted/30 p-4 rounded">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(previewData, null, 2)}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
