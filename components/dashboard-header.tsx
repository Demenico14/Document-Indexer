import { FileText } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Document Indexer</h1>
      </div>
      <p className="text-muted-foreground">
        Upload, search, and export structured data from Excel, CSV, and XML files.
      </p>
    </div>
  )
}
