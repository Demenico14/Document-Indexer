import * as XLSX from "xlsx"
import { parse as parseCsvString } from "csv-parse/sync"
import fs from "fs"
import path from "path"
import type { File } from "@prisma/client/default.js"
import { supabase } from "@/lib/supabase"

// Update the function signature to accept a sheet parameter
export async function getFilePreview(file: File, sheetName?: string) {
  try {
    console.log("Getting preview for file:", file.filename)

    // First try to download the file from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .download(file.filename)

    if (downloadError) {
      console.error("Error downloading file from Supabase:", downloadError)

      // Try to find the file locally as a fallback
      const uploadsPath = path.join(process.cwd(), "uploads")

      // Make sure the uploads directory exists
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true })
      }

      const filePath = path.join(uploadsPath, file.filename)

      // Log for debugging
      console.log(`Looking for file locally at: ${filePath}`)
      console.log(`File exists locally: ${fs.existsSync(filePath)}`)

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found in Supabase or locally: ${file.filename}`)
      }

      // If file exists locally, read it
      const fileBuffer = fs.readFileSync(filePath)
      console.log(`Successfully read local file with size: ${fileBuffer.length} bytes`)

      // Process the file based on its type
      switch (file.fileType.toLowerCase()) {
        case "xlsx":
        case "xls":
          return previewExcel(fileBuffer, sheetName)
        case "csv":
          return previewCsv(fileBuffer)
        case "xml":
          return previewXml(fileBuffer)
        default:
          throw new Error("Unsupported file type")
      }
    }

    // If we successfully downloaded from Supabase, process the file
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`Successfully downloaded file from Supabase with size: ${buffer.length} bytes`)

    // Process the file based on its type
    switch (file.fileType.toLowerCase()) {
      case "xlsx":
      case "xls":
        return previewExcel(buffer, sheetName)
      case "csv":
        return previewCsv(buffer)
      case "xml":
        return previewXml(buffer)
      default:
        throw new Error("Unsupported file type")
    }
  } catch (error) {
    console.error("Error in getFilePreview:", error)
    // Return mock data as fallback, but with a warning
    return {
      warning: "Could not read actual file content. Showing sample data instead.",
      ...getMockPreviewData(file.fileType),
    }
  }
}

// Generate mock preview data based on file type
function getMockPreviewData(fileType: string) {
  switch (fileType.toLowerCase()) {
    case "xlsx":
    case "xls":
    case "csv":
      return {
        headers: ["ID", "Name", "Email", "Department", "Position"],
        rows: [
          [1001, "John Doe", "john@example.com", "IT", "Developer"],
          [1002, "Jane Smith", "jane@example.com", "HR", "Manager"],
          [1003, "Bob Johnson", "bob@example.com", "Finance", "Analyst"],
          [1004, "Alice Brown", "alice@example.com", "Marketing", "Specialist"],
          [1005, "Charlie Wilson", "charlie@example.com", "Sales", "Director"],
        ],
      }
    case "xml":
      return {
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</catalog>`,
      }
    default:
      return { headers: [], rows: [] }
  }
}

// Update the previewExcel function to accept a sheet parameter
function previewExcel(buffer: Buffer, sheetName?: string) {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer", cellStyles: true, cellDates: true })

    // Get all sheet names
    const sheetNames = workbook.SheetNames

    // Use the provided sheet name or default to the first sheet
    const selectedSheet = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0]

    const sheet = workbook.Sheets[selectedSheet]

    // Check if any sheet has images
    let hasImages = false
    for (const name of sheetNames) {
      const s = workbook.Sheets[name]
      if (s["!objects"] && s["!objects"].length > 0) {
        hasImages = true
        break
      }
    }

    // Convert to JSON with headers
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

    if (json.length === 0) {
      return {
        headers: [],
        rows: [],
        sheets: sheetNames,
        currentSheet: selectedSheet,
        hasImages,
      }
    }

    // Get headers from first row
    const headers = (json[0] as string[]).map((h) => h || "(Unnamed Column)")

    // Get data rows (limit to 100)
    const rows = json.slice(1, 101) as any[][]

    return {
      headers,
      rows,
      sheets: sheetNames,
      currentSheet: selectedSheet,
      hasImages,
    }
  } catch (error) {
    console.error("Error previewing Excel:", error)
    return {
      warning: "Error previewing Excel file: " + (error instanceof Error ? error.message : String(error)),
      ...getMockPreviewData("xlsx"),
    }
  }
}

function previewCsv(buffer: Buffer) {
  const csvString = buffer.toString("utf-8")
  console.log("CSV content preview:", csvString.substring(0, 200))

  try {
    // Parse CSV
    const parsed = parseCsvString(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (parsed.length === 0) {
      return { headers: [], rows: [] }
    }

    // Get headers from first row
    const headers = Object.keys(parsed[0])

    // Convert to rows format
    const rows = parsed.slice(0, 100).map((row: any) => {
      return headers.map((header) => row[header])
    })

    return { headers, rows }
  } catch (error) {
    console.error("Error parsing CSV:", error)

    // Try a simpler approach - split by lines and commas
    try {
      const lines = csvString.split("\n")
      if (lines.length === 0) return { headers: [], rows: [] }

      const headers = lines[0].split(",").map((h) => h.trim())
      const rows = lines.slice(1, 101).map((line) => line.split(",").map((cell) => cell.trim()))

      return { headers, rows }
    } catch (fallbackError) {
      console.error("Failed fallback CSV parsing:", fallbackError)
      return {
        warning: "Error parsing CSV file: " + (error instanceof Error ? error.message : String(error)),
        ...getMockPreviewData("csv"),
      }
    }
  }
}

function previewXml(buffer: Buffer) {
  try {
    const xmlString = buffer.toString("utf-8")

    // Format XML for display (simple formatting)
    const formattedXml = xmlString
      .replace(/></g, ">\n<")
      .replace(/>\s*</g, ">\n<")
      .replace(/\s+</g, "<")
      .replace(/>\s+/g, ">")

    return { xml: formattedXml }
  } catch (error) {
    console.error("Error parsing XML:", error)
    return {
      warning: "Error parsing XML file: " + (error instanceof Error ? error.message : String(error)),
      ...getMockPreviewData("xml"),
    }
  }
}
