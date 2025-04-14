"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  fileType: string
  uploadedAt: string
  rowCount: number
}

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    const allowedExtensions = ["xlsx", "xls", "csv", "xml"]

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`File type not supported. Please upload ${allowedExtensions.join(", ")} files only.`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Create an XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setUploadedFile(response.file)
          setFileUrl(response.url)
          setFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            setError(errorData.error || "Upload failed")
          } catch (e) {
            setError(`Upload failed with status ${xhr.status}`)
          }
        }
        setIsUploading(false)
      }

      xhr.onerror = () => {
        setError("An error occurred during the upload")
        setIsUploading(false)
      }

      xhr.send(formData)
    } catch (err) {
      setError("Failed to upload file")
      setIsUploading(false)
      console.error("Upload error:", err)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadedFile(null)
    setFileUrl(null)
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload Excel, CSV, or XML files to Supabase Storage</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedFile && fileUrl ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-400">
                File uploaded successfully!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">File Name:</p>
              <p className="text-sm">{uploadedFile.originalName}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">File URL:</p>
              <div className="flex items-center space-x-2">
                <Input
                  value={fileUrl}
                  readOnly
                  className="text-xs"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(fileUrl)
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">File Type:</p>
              <p className="text-sm">{uploadedFile.fileType.toUpperCase()}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Upload Date:</p>
              <p className="text-sm">{new Date(uploadedFile.uploadedAt).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isUploading ? "border-primary/50 bg-primary/5" : "border-border"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{file ? file.name : "Drag and drop your file"}</h3>
                <p className="text-sm text-muted-foreground">
                  {file ? `${Math.round(file.size / 1024)} KB - ${file.type}` : "or click to browse"}
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv,.xml"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {!file && (
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    Select File
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {uploadedFile ? (
          <Button onClick={resetUpload}>Upload Another File</Button>
        ) : (
          <>
            <Button variant="outline" onClick={resetUpload} disabled={!file || isUploading}>
              Cancel
            </Button>
            <Button onClick={uploadFile} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
