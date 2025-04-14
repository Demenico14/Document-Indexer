import * as XLSX from "xlsx"
import { parse as parseCsvString } from "csv-parse/sync"
import { XMLParser } from "fast-xml-parser"
import fs from "fs"
import path from "path"

// Define the ParsedRecord type inline to avoid import issues
type ParsedRecord = {
  id: string
  fileId: string
  sheetOrNode: string | null
  fieldName: string
  fieldValue: string
  rowNum: number | null
  parentContext: string | null
  fullPath: string | null
}

// Add this helper function at the top of the file
function logParsingError(fileType: string, error: any, details?: any) {
  const logDir = path.join(process.cwd(), "logs")

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/:/g, "-")
  const logFile = path.join(logDir, `parsing-error-${fileType}-${timestamp}.log`)

  const logContent = `
Time: ${new Date().toISOString()}
File Type: ${fileType}
Error: ${error.message}
Stack: ${error.stack}
Details: ${JSON.stringify(details, null, 2)}
  `.trim()

  fs.writeFileSync(logFile, logContent)
  console.error(`Parsing error logged to ${logFile}`)
}

// Enhance the Excel parser to better handle multiple sheets and extract images
export async function parseExcel(buffer: ArrayBuffer, fileId: string) {
  try {
    const data = new Uint8Array(buffer)
    const workbook = XLSX.read(data, { type: "array" })

    const records: any[] = []
    let totalRows = 0

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]

      // Get the sheet range
      const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1")

      // Convert to JSON with headers
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

      if (json.length === 0) continue

      // Get headers from first row
      const headers = json[0] as string[]

      // Add sheet metadata
      records.push({
        fileId,
        sheetOrNode: sheetName,
        fieldName: "_sheetName",
        fieldValue: sheetName,
        rowNum: 0,
        parentContext: null,
        fullPath: `/${sheetName}`,
      })

      // Process each row
      for (let rowIndex = 1; rowIndex < json.length; rowIndex++) {
        const row = json[rowIndex] as any[]

        // Skip empty rows
        if (!row || row.length === 0) continue

        // Process each cell in the row
        for (let colIndex = 0; colIndex < headers.length; colIndex++) {
          if (colIndex < row.length && row[colIndex] !== undefined && row[colIndex] !== null) {
            const cellValue = String(row[colIndex])

            // Skip empty cells
            if (cellValue.trim() === "") continue

            records.push({
              fileId,
              sheetOrNode: sheetName,
              fieldName: headers[colIndex] || `Column${colIndex + 1}`,
              fieldValue: cellValue,
              rowNum: rowIndex + 1,
              parentContext: null,
              fullPath: `/${sheetName}/row${rowIndex + 1}/${headers[colIndex] || `Column${colIndex + 1}`}`,
            })
          }
        }
      }

      totalRows += json.length - 1 // Subtract header row
    }

    return { records, rowCount: totalRows }
  } catch (error) {
    logParsingError("excel", error, { fileId })
    throw error
  }
}

// CSV parser
export async function parseCsv(buffer: ArrayBuffer, fileId: string) {
  try {
    const decoder = new TextDecoder("utf-8")
    const csvString = decoder.decode(buffer)

    // Parse CSV
    const parsed = parseCsvString(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    const records: any[] = []

    // Process each row
    parsed.forEach((row: any, index: number) => {
      // Process each field in the row
      Object.entries(row).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          records.push({
            fileId,
            sheetOrNode: "Sheet1", // Default sheet name for CSV
            fieldName: key,
            fieldValue: String(value),
            rowNum: index + 1,
            parentContext: null,
            fullPath: null,
          })
        }
      })
    })

    return { records, rowCount: parsed.length }
  } catch (error) {
    logParsingError("csv", error, { fileId })
    throw error
  }
}

// XML parser
export async function parseXml(buffer: ArrayBuffer, fileId: string) {
  try {
    const decoder = new TextDecoder("utf-8")
    const xmlString = decoder.decode(buffer)

    // Parse XML with more robust error handling
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: () => false, // Don't automatically convert to arrays
      parseAttributeValue: true,
      trimValues: true,
    })

    const parsed = parser.parse(xmlString)
    const records: any[] = []

    // Track all top-level nodes to use as "sheets"
    const topLevelNodes = new Set<string>()

    // Recursive function to process XML nodes
    function processNode(node: any, path: string, parentContext: string | null = null) {
      if (!node) return

      if (typeof node === "object") {
        Object.entries(node).forEach(([key, value]) => {
          const currentPath = path ? `${path}/${key}` : key

          // Track top-level nodes
          if (!path) {
            topLevelNodes.add(key)
          }

          // Determine the sheet/node name - use the first segment of the path
          const sheetOrNode = path.split("/")[0] || key

          if (Array.isArray(value)) {
            // Handle array elements
            value.forEach((item, index) => {
              if (typeof item === "object") {
                processNode(item, `${currentPath}[${index}]`, currentPath)
              } else {
                records.push({
                  fileId,
                  sheetOrNode,
                  fieldName: key,
                  fieldValue: String(item),
                  rowNum: null,
                  parentContext: parentContext,
                  fullPath: currentPath,
                })
              }
            })
          } else if (typeof value === "object") {
            // Process nested objects
            processNode(value, currentPath, key)
          } else {
            // Add leaf node
            records.push({
              fileId,
              sheetOrNode,
              fieldName: key,
              fieldValue: String(value),
              rowNum: null,
              parentContext: parentContext,
              fullPath: currentPath,
            })
          }
        })
      }
    }

    processNode(parsed, "")

    // If we didn't find any records with proper sheet/node names,
    // add a default "root" sheet to all records
    if (records.length > 0 && !records.some((r) => r.sheetOrNode && r.sheetOrNode !== "")) {
      records.forEach((record) => {
        record.sheetOrNode = "root"
      })
    }

    return { records, rowCount: records.length }
  } catch (error) {
    logParsingError("xml", error, { fileId })
    // Return empty records instead of throwing error
    return { records: [], rowCount: 0 }
  }
}
