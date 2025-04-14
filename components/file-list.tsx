"use client"

import { useState, useEffect } from "react"
import { Eye, Search, Trash2, FileSpreadsheet, FileText, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FilePreviewModal } from "@/components/file-preview-modal"

interface File {
  id: string
  filename: string
  fileType: string
  uploadedAt: string
  rowCount: number
  originalName: string
}

export function FileList() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/files")
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles(files.filter((file) => file.id !== id))
        toast({
          title: "Success",
          description: "File deleted successfully",
        })
      } else {
        throw new Error("Failed to delete file")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (file: File) => {
    setPreviewFile(file)
    setShowPreviewModal(true)
  }

  const handleSearch = (fileId: string) => {
    // Redirect to search page with file filter
    window.location.href = `/?tab=search&fileId=${fileId}`
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "xlsx":
      case "xls":
      case "csv":
        return <FileSpreadsheet className="h-5 w-5" />
      case "xml":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Uploaded Files</h2>

      {files.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No files uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.fileType)}
                  <CardTitle className="text-lg truncate">{file.originalName}</CardTitle>
                </div>
                <CardDescription className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(file.uploadedAt)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium uppercase">{file.fileType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rows:</span>
                    <span className="font-medium">{file.rowCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePreview(file)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSearch(file.id)}>
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showPreviewModal && previewFile && (
        <FilePreviewModal file={previewFile} isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} />
      )}
    </div>
  )
}
