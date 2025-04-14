"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"
import { SearchInterface } from "@/components/search-interface"
import { DashboardHeader } from "@/components/dashboard-header"
import { FilePreview } from "@/components/file-preview"
import { XmlPreview } from "@/components/xml-preview"
import { DiagnosticsPanel } from "@/components/diagnostics-panel"
import { QuotationSystem } from "@/components/quotation-system"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL parameters for tab selection
    const tabParam = searchParams.get("tab")
    if (tabParam) {
      setActiveTab(tabParam)
      console.log(`Tab selected from URL parameter: ${tabParam}`)
    }
  }, [searchParams])

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <DashboardHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-7 mb-8">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="xml-preview">XML Preview</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <FileUpload />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileList />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <SearchInterface />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <FilePreview />
        </TabsContent>

        <TabsContent value="xml-preview" className="mt-6">
          <XmlPreview />
        </TabsContent>

        <TabsContent value="diagnostics" className="mt-6">
          <DiagnosticsPanel />
        </TabsContent>

        <TabsContent value="quotation" className="mt-6">
          <QuotationSystem />
        </TabsContent>
      </Tabs>
    </main>
  )
}
