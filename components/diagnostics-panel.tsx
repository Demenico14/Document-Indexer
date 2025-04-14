"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchDiagnostics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/diagnostics")
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch diagnostics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Diagnostics</CardTitle>
        <CardDescription>Check system status and troubleshoot file parsing issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchDiagnostics} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Diagnostics
          </Button>

          {diagnostics && (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">System Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Timestamp:</div>
                  <div>{diagnostics.timestamp}</div>
                  <div className="font-medium">Environment:</div>
                  <div>{diagnostics.environment}</div>
                  <div className="font-medium">XLSX Library Version:</div>
                  <div>{diagnostics.xlsxVersion}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">File Storage</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    {diagnostics.uploadsDirectory.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    )}
                    <span>
                      Uploads Directory: {diagnostics.uploadsDirectory.path}
                      {!diagnostics.uploadsDirectory.exists && " (Not found)"}
                    </span>
                  </div>

                  {diagnostics.uploadsDirectory.exists && (
                    <div className="pl-7">
                      <p className="text-sm text-muted-foreground mb-1">
                        {diagnostics.uploadsDirectory.files.length} files found
                      </p>
                      {diagnostics.uploadsDirectory.files.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border rounded p-2 text-xs">
                          {diagnostics.uploadsDirectory.files.map((file: string) => (
                            <div key={file} className="flex items-center py-1">
                              <FileText className="h-3 w-3 mr-1" />
                              {file}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center mt-2">
                    {diagnostics.logsDirectory.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    )}
                    <span>
                      Logs Directory: {diagnostics.logsDirectory.path}
                      {!diagnostics.logsDirectory.exists && " (Not found)"}
                    </span>
                  </div>

                  {diagnostics.logsDirectory.exists && diagnostics.logsDirectory.files.length > 0 && (
                    <div className="pl-7">
                      <p className="text-sm text-muted-foreground mb-1">
                        {diagnostics.logsDirectory.files.length} error logs found
                      </p>
                      <div className="max-h-32 overflow-y-auto border rounded p-2 text-xs">
                        {diagnostics.logsDirectory.files.map((file: string) => (
                          <div key={file} className="flex items-center py-1 text-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Database Statistics</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Total Files:</div>
                  <div>{diagnostics.database.files}</div>
                  <div className="font-medium">Total Records:</div>
                  <div>{diagnostics.database.records}</div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-1">File Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {diagnostics.database.fileTypes.map((type: string) => (
                      <div key={type} className="px-2 py-1 bg-muted rounded-md text-xs">
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-1">Sheet Distribution:</h4>
                  <div className="max-h-48 overflow-y-auto border rounded p-2">
                    {Object.entries(diagnostics.database.sheetCounts).map(([sheet, count]: [string, any]) => (
                      <div key={sheet} className="flex justify-between py-1 text-sm border-b last:border-0">
                        <span>{sheet}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
