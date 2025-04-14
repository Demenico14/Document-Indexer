"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, Download, ChevronDown, ChevronUp, Eye, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { RecordPreviewModal } from "@/components/record-preview-modal"
import { generatePdf } from "@/lib/pdf-generator"
import type { FileRecord } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface File {
  id: string
  filename: string
  fileType: string
}

export function SearchInterface() {
  const [searchTerm, setSearchTerm] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all")
  const [fieldNameFilter, setFieldNameFilter] = useState<string>("all")
  const [sheetFilter, setSheetFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<FileRecord[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<FileRecord | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [availableFileTypes, setAvailableFileTypes] = useState<string[]>([])
  const [availableFieldNames, setAvailableFieldNames] = useState<string[]>([])
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [exportLoading, setExportLoading] = useState(false)
  const { toast } = useToast()
  const [activeSheets, setActiveSheets] = useState<Set<string>>(new Set())
  const [availableSheetsMap, setAvailableSheetsMap] = useState<Record<string, number>>({})

  const pageSize = 20

  useEffect(() => {
    fetchFilters()
    searchRecords()
  }, [page, fileTypeFilter, fieldNameFilter, sheetFilter, activeSheets])

  // Save selected records to localStorage when they change
  useEffect(() => {
    if (selectedRecords.size > 0) {
      const selectedArray = Array.from(selectedRecords)
      localStorage.setItem("selectedRecords", JSON.stringify(selectedArray))

      // Also save the full record data for selected records
      const selectedRecordsData = records.filter((record) => selectedRecords.has(record.id))
      localStorage.setItem("selectedRecordsData", JSON.stringify(selectedRecordsData))
    } else {
      localStorage.removeItem("selectedRecords")
      localStorage.removeItem("selectedRecordsData")
    }
  }, [selectedRecords, records])

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filters")
      const data = await response.json()
      setAvailableFileTypes(data.fileTypes)
      setAvailableFieldNames(data.fieldNames)
      setAvailableSheets(data.sheets)

      // Set the sheet counts map
      if (data.sheetCounts) {
        setAvailableSheetsMap(data.sheetCounts)
      }
    } catch (error) {
      console.error("Failed to fetch filters:", error)
    }
  }

  const searchRecords = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        q: searchTerm,
        page: page.toString(),
        pageSize: pageSize.toString(),
        fileType: fileTypeFilter !== "all" ? fileTypeFilter : "",
        fieldName: fieldNameFilter !== "all" ? fieldNameFilter : "",
        sheet: sheetFilter !== "all" ? sheetFilter : "",
      })

      // Add active sheets if any are selected
      if (activeSheets.size > 0) {
        Array.from(activeSheets).forEach((sheet) => {
          params.append("activeSheets", sheet)
        })
      }

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      setRecords(data.records)
      setTotalRecords(data.total)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    searchRecords()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set())
    } else {
      const newSelected = new Set<string>()
      records.forEach((record) => newSelected.add(record.id))
      setSelectedRecords(newSelected)
    }
    setSelectAll(!selectAll)
  }

  const handleSelectRecord = (id: string) => {
    const newSelected = new Set(selectedRecords)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRecords(newSelected)
    setSelectAll(newSelected.size === records.length)
  }

  const handlePreview = (record: FileRecord) => {
    setPreviewRecord(record)
    setShowPreviewModal(true)
  }

  const handleExportPdf = async () => {
    try {
      setExportLoading(true)

      // Determine which records to export
      const recordsToExport =
        selectedRecords.size > 0 ? records.filter((record) => selectedRecords.has(record.id)) : records

      if (recordsToExport.length === 0) {
        toast({
          title: "No records selected",
          description: "Please select at least one record to export",
          variant: "destructive",
        })
        return
      }

      // Generate PDF
      await generatePdf(recordsToExport, searchTerm)

      toast({
        title: "Export successful",
        description: `${recordsToExport.length} records exported to PDF`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting to PDF",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleViewSelectedInPreview = () => {
    if (selectedRecords.size === 0) {
      toast({
        title: "No records selected",
        description: "Please select at least one record to view in preview",
        variant: "destructive",
      })
      return
    }

    // Navigate to the preview tab
    window.location.href = "/?tab=preview"
  }

  // Modify the handleCreateQuotation function to fetch context data before sending to quotation
  const handleCreateQuotation = async () => {
    // Get the selected records
    const selectedRecordsData = records.filter((record) => selectedRecords.has(record.id))

    if (selectedRecordsData.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select at least one record to create a quotation",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      toast({
        title: "Preparing quotation data",
        description: "Fetching context data for selected records...",
      })

      // Fetch context data for all selected records
      const recordsWithContext = await Promise.all(
        selectedRecordsData.map(async (record) => {
          try {
            const response = await fetch(`/api/records/${record.id}/context`)
            const contextData = await response.json()
            return {
              ...record,
              context: contextData,
            }
          } catch (error) {
            console.error(`Failed to fetch context for record ${record.id}:`, error)
            return {
              ...record,
              context: null,
            }
          }
        }),
      )

      // Store the selected records with context in localStorage for the quotation system to use
      localStorage.setItem("quotationRecords", JSON.stringify(recordsWithContext))

      // Log for debugging
      console.log(`Sending ${recordsWithContext.length} records with context to quotation system`)

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
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalRecords / pageSize)

  // Group records by sheet for better organization
  const recordsBySheet: Record<string, FileRecord[]> = {}
  records.forEach((record) => {
    const sheetName = record.sheetOrNode || "Unknown"
    if (!recordsBySheet[sheetName]) {
      recordsBySheet[sheetName] = []
    }
    recordsBySheet[sheetName].push(record)
  })

  const toggleSheetSelection = (sheet: string) => {
    const newActiveSheets = new Set(activeSheets)
    if (newActiveSheets.has(sheet)) {
      newActiveSheets.delete(sheet)
    } else {
      newActiveSheets.add(sheet)
    }
    setActiveSheets(newActiveSheets)

    // Trigger search with updated sheets
    if (searchTerm) {
      searchRecords()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search across all fields..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                Search
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="sm:w-auto w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="file-type">File Type</Label>
                  <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                    <SelectTrigger id="file-type">
                      <SelectValue placeholder="All file types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All file types</SelectItem>
                      {availableFileTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-name">Field Name</Label>
                  <Select value={fieldNameFilter} onValueChange={setFieldNameFilter}>
                    <SelectTrigger id="field-name">
                      <SelectValue placeholder="All fields" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All fields</SelectItem>
                      {availableFieldNames.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheet">Sheet/Node</Label>
                  <Select value={sheetFilter} onValueChange={setSheetFilter}>
                    <SelectTrigger id="sheet">
                      <SelectValue placeholder="All sheets/nodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sheets/nodes</SelectItem>
                      {availableSheets.map((sheet) => (
                        <SelectItem key={sheet} value={sheet}>
                          {sheet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Excel Sheets</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSheets
                      .filter((sheet) => availableSheetsMap[sheet] > 0)
                      .map((sheet) => (
                        <Badge
                          key={sheet}
                          variant={activeSheets.has(sheet) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSheetSelection(sheet)}
                        >
                          {sheet} ({availableSheetsMap[sheet] || 0})
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          {loading
            ? "Loading..."
            : `Showing ${records.length > 0 ? (page - 1) * pageSize + 1 : 0} - ${Math.min(page * pageSize, totalRecords)} of ${totalRecords} records`}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleViewSelectedInPreview} disabled={selectedRecords.size === 0}>
            <Eye className="h-4 w-4 mr-2" />
            View Selected in Preview
          </Button>
          <Button variant="outline" onClick={handleCreateQuotation} disabled={selectedRecords.size === 0}>
            <FileText className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={loading || exportLoading || records.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportLoading ? "Exporting..." : "Export to PDF"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No records found</p>
        </div>
      ) : (
        <div>
          {Object.entries(recordsBySheet).map(([sheetName, sheetRecords]) => (
            <div key={sheetName} className="border rounded-lg overflow-hidden mb-6">
              <div className="bg-muted px-4 py-2 font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Sheet/Node: {sheetName}
                <Badge variant="outline" className="ml-2">
                  {sheetRecords.length} records
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center">
                          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Field Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Row/Path
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sheetRecords.map((record: FileRecord) => (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Checkbox
                            checked={selectedRecords.has(record.id)}
                            onCheckedChange={() => handleSelectRecord(record.id)}
                            aria-label={`Select record ${record.id}`}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{record.fieldName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm max-w-xs truncate">{record.fieldValue}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {record.fileName}
                          <span className="ml-1 text-xs text-muted-foreground">({record.fileType.toUpperCase()})</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {record.rowNum ? `Row ${record.rowNum}` : record.fullPath}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm" onClick={() => handlePreview(record)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = page
                if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  )
                }
                return null
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showPreviewModal && previewRecord && (
        <RecordPreviewModal
          record={previewRecord}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  )
}
