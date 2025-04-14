"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      await uploadFiles(files)
    }
  }

  const uploadFiles = async (files: File[]) => {
    // Validate file types
    const validTypes = [".xlsx", ".xls", ".csv", ".xml"]
    const invalidFiles = files.filter((file) => {
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      return !validTypes.includes(extension)
    })

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only .xlsx, .xls, .csv, and .xml files are supported.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setProgress(0)
    setUploadStatus("idle")

    try {
      // Create FormData
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files", file)
      })

      // Upload files with progress tracking
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadStatus("success")
          toast({
            title: "Upload successful",
            description: `${files.length} file(s) uploaded and processed.`,
          })
        } else {
          setUploadStatus("error")
          toast({
            title: "Upload failed",
            description: "There was an error uploading your files.",
            variant: "destructive",
          })
        }
        setIsUploading(false)
      }

      xhr.onerror = () => {
        setUploadStatus("error")
        toast({
          title: "Upload failed",
          description: "There was an error uploading your files.",
          variant: "destructive",
        })
        setIsUploading(false)
      }

      xhr.send(formData)
    } catch (error) {
      setUploadStatus("error")
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Files</CardTitle>
        <CardDescription>Upload Excel, CSV, or XML files to index and search their contents.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Drag and drop your files</h3>
              <p className="text-sm text-muted-foreground">Supported formats: .xlsx, .xls, .csv, .xml</p>
            </div>
            <div>
              <Button
                variant="outline"
                className="mt-2"
                disabled={isUploading}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Select Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.xml"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="mt-6 flex items-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>Files uploaded successfully</span>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="mt-6 flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error uploading files</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Files will be parsed immediately and stored in the database.
      </CardFooter>
    </Card>
  )
}
