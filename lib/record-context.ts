import * as XLSX from "xlsx"
import { parse as parseCsvString } from "csv-parse/sync"
import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client/default.js"
import { supabase } from "@/lib/supabase"

const prisma = new PrismaClient()

// Define the interface with all required properties
interface RecordWithFile {
  id: string
  fileId: string
  file: {
    id: string
    filename: string
    fileType: string
    originalName: string
    uploadedAt: Date
    rowCount: number
  }
  sheetOrNode: string | null
  fieldName: string
  fieldValue: string
  rowNum: number | null
  parentContext: string | null
  fullPath: string | null
}

export async function getRecordContext(record: RecordWithFile) {
  try {
    console.log("Getting context for record:", record.id, "from file:", record.file.filename)

    // First try to download the file from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .download(record.file.filename)

    if (downloadError) {
      console.error("Error downloading file from Supabase:", downloadError)

      // Try to find the file locally as a fallback
      const uploadsPath = path.join(process.cwd(), "uploads")

      // Make sure the uploads directory exists
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true })
      }

      const filePath = path.join(uploadsPath, record.file.filename)

      // Log for debugging
      console.log(`Looking for file locally at: ${filePath}`)
      console.log(`File exists locally: ${fs.existsSync(filePath)}`)

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found in Supabase or locally: ${record.file.filename}`)
      }

      // If file exists locally, read it
      const fileBuffer = fs.readFileSync(filePath)
      console.log(`Successfully read local file with size: ${fileBuffer.length} bytes`)

      // Process the file based on its type
      switch (record.file.fileType.toLowerCase()) {
        case "xlsx":
        case "xls":
        case "csv":
          return getSpreadsheetContext(fileBuffer, record)
        case "xml":
          return getXmlContext(fileBuffer, record)
        default:
          throw new Error("Unsupported file type")
      }
    }

    // If we successfully downloaded from Supabase, process the file
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`Successfully downloaded file from Supabase with size: ${buffer.length} bytes`)

    // Process the file based on its type
    switch (record.file.fileType.toLowerCase()) {
      case "xlsx":
      case "xls":
      case "csv":
        return getSpreadsheetContext(buffer, record)
      case "xml":
        return getXmlContext(buffer, record)
      default:
        throw new Error("Unsupported file type")
    }
  } catch (error) {
    console.error("Error in getRecordContext:", error)
    // Return mock data as fallback
    return getMockContextData(record)
  }
}

// Generate mock context data based on record type
function getMockContextData(record: RecordWithFile) {
  if (record.file.fileType.toLowerCase() === "xml") {
    return {
      warning: "Could not read actual file content. Showing sample data instead.",
      xmlNode: `<${record.fieldName}>${record.fieldValue}</${record.fieldName}>`,
    }
  } else {
    // For spreadsheet files
    const rowData: Record<string, any> = {
      [record.fieldName]: record.fieldValue,
    }

    // Add some mock fields
    rowData["ID"] = "MOCK-" + Math.floor(Math.random() * 1000)
    rowData["CreatedAt"] = new Date().toISOString()
    rowData["Status"] = "Active"

    return {
      warning: "Could not read actual file content. Showing sample data instead.",
      rowData,
    }
  }
}

async function getSpreadsheetContext(buffer: Buffer, record: RecordWithFile) {
  if (record.file.fileType.toLowerCase() === "csv") {
    return getCsvRowContext(buffer, record)
  } else {
    return getExcelRowContext(buffer, record)
  }
}

function getExcelRowContext(buffer: Buffer, record: RecordWithFile) {
  if (!record.rowNum) {
    return { rowData: {} }
  }

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })

    // If sheet name is not found, try to use the first sheet
    let sheetName = record.sheetOrNode || ""
    if (!sheetName || !workbook.Sheets[sheetName]) {
      sheetName = workbook.SheetNames[0]
      console.log(`Sheet ${record.sheetOrNode || "null"} not found, using first sheet: ${sheetName}`)
    }

    const sheet = workbook.Sheets[sheetName]

    if (!sheet) {
      console.error(`Sheet not found: ${sheetName}`)
      return { rowData: {}, warning: "Sheet not found in Excel file" }
    }

    // Convert to JSON with headers
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    if (json.length < record.rowNum) {
      console.error(`Row ${record.rowNum} not found in sheet with ${json.length} rows`)
      return { rowData: {}, warning: `Row ${record.rowNum} not found in sheet` }
    }

    // Get headers from first row
    const headers = json[0] as string[]

    // Get the specific row
    const row = json[record.rowNum - 1] as any[]

    // Create an object with field names and values
    const rowData: Record<string, any> = {}
    headers.forEach((header, index) => {
      if (index < row.length) {
        rowData[header || `Column${index + 1}`] = row[index]
      }
    })

    return { rowData }
  } catch (error) {
    console.error("Error parsing Excel file:", error)
    return {
      rowData: { [record.fieldName]: record.fieldValue },
      warning: "Error parsing Excel file: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

function getCsvRowContext(buffer: Buffer, record: RecordWithFile) {
  if (!record.rowNum) {
    return { rowData: {} }
  }

  const csvString = buffer.toString("utf-8")

  try {
    // Parse CSV
    const parsed = parseCsvString(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (parsed.length < record.rowNum) {
      return { rowData: {}, warning: `Row ${record.rowNum} not found in CSV with ${parsed.length} rows` }
    }

    // Get the specific row (adjust for 0-based index)
    const rowData = parsed[record.rowNum - 1]

    return { rowData }
  } catch (error) {
    console.error("Error parsing CSV:", error)

    // Try a simpler approach - split by lines and commas
    try {
      const lines = csvString.split("\n")
      if (lines.length < record.rowNum) {
        return { rowData: {}, warning: `Row ${record.rowNum} not found in CSV with ${lines.length} lines` }
      }

      const headers = lines[0].split(",").map((h) => h.trim())
      const rowLine = lines[record.rowNum - 1]
      const cells = rowLine.split(",").map((cell) => cell.trim())

      const rowData: Record<string, any> = {}
      headers.forEach((header, index) => {
        if (index < cells.length) {
          rowData[header || `Column${index + 1}`] = cells[index]
        }
      })

      return { rowData }
    } catch (fallbackError) {
      console.error("Failed fallback CSV parsing:", fallbackError)
      return {
        rowData: { [record.fieldName]: record.fieldValue },
        warning: "Error parsing CSV file: " + (error instanceof Error ? error.message : String(error)),
      }
    }
  }
}

function getXmlContext(buffer: Buffer, record: RecordWithFile) {
  try {
    const xmlString = buffer.toString("utf-8")

    // If we have a full path, try to extract the XML node
    if (record.fullPath) {
      // This is a simplified approach - for a real app, you'd need a more robust XML node extraction
      // based on the path, possibly using XPath or a similar technology

      // For now, we'll just return a section of the XML that might contain the node
      const fieldName = record.fieldName
      const fieldValue = record.fieldValue

      // Simple regex to find the node and its context
      const regex = new RegExp(
        `<[^>]*${fieldName}[^>]*>[^<]*${fieldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*</${fieldName}>`,
        "g",
      )
      const match = regex.exec(xmlString)

      if (match) {
        // Get some context around the match
        const start = Math.max(0, match.index - 200)
        const end = Math.min(xmlString.length, match.index + match[0].length + 200)
        const context = xmlString.substring(start, end)

        // Format the XML snippet
        const formattedXml = context
          .replace(/></g, ">\n<")
          .replace(/>\s*</g, ">\n<")
          .replace(/\s+</g, "<")
          .replace(/>\s+/g, ">")

        return { xmlNode: formattedXml }
      }
    }

    // Fallback: return a small portion of the XML
    const preview = xmlString.substring(0, 1000)
    const formattedXml = preview
      .replace(/></g, ">\n<")
      .replace(/>\s*</g, ">\n<")
      .replace(/\s+</g, "<")
      .replace(/>\s+/g, ">")

    return { xmlNode: formattedXml }
  } catch (error) {
    console.error("Error parsing XML:", error)
    return {
      xmlNode: `<${record.fieldName}>${record.fieldValue}</${record.fieldName}>`,
      warning: "Error parsing XML file: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}
