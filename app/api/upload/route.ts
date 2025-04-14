import { type NextRequest, NextResponse } from "next/server"
import { parseExcel, parseCsv, parseXml } from "@/lib/file-parsers"
import type { ParsedRecord } from "@/lib/types"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const results = []

    for (const file of files) {
      try {
        const fileBuffer = await file.arrayBuffer()
        const fileName = file.name
        const fileType = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()

        // Generate a unique filename
        const uniqueFilename = `${path.basename(fileName, `.${fileType}`)}-${Date.now()}.${fileType}`

        // Create file record
        const fileRecord = await prisma.file.create({
          data: {
            filename: uniqueFilename,
            fileType: fileType,
            originalName: fileName,
            uploadedAt: new Date(),
            rowCount: 0, // Will update after parsing
          },
        })

        // Save the file to disk
        const filePath = path.join(uploadsDir, uniqueFilename)
        fs.writeFileSync(filePath, Buffer.from(fileBuffer))
        console.log(`File saved to: ${filePath}`)

        // Parse file based on type
        let parsedRecords: ParsedRecord[] = []
        let rowCount = 0

        try {
          if (fileType === "xlsx" || fileType === "xls") {
            const result = await parseExcel(fileBuffer, fileRecord.id)
            parsedRecords = result.records
            rowCount = result.rowCount
          } else if (fileType === "csv") {
            const result = await parseCsv(fileBuffer, fileRecord.id)
            parsedRecords = result.records
            rowCount = result.rowCount
          } else if (fileType === "xml") {
            const result = await parseXml(fileBuffer, fileRecord.id)
            parsedRecords = result.records
            rowCount = result.rowCount
          } else {
            throw new Error("Unsupported file type")
          }
        } catch (parseError) {
          console.error(`Error parsing file ${fileName}:`, parseError)
          // Continue with empty records rather than failing the whole upload
          parsedRecords = []
          rowCount = 0
        }

        // Insert parsed records in batches
        if (parsedRecords.length > 0) {
          try {
            // Insert in batches of 1000
            const batchSize = 1000
            for (let i = 0; i < parsedRecords.length; i += batchSize) {
              const batch = parsedRecords.slice(i, i + batchSize)
              await prisma.parsedRecord.createMany({
                data: batch,
              })
            }
          } catch (dbError) {
            console.error(`Error inserting records for ${fileName}:`, dbError)
          }
        }

        // Update file record with row count
        await prisma.file.update({
          where: { id: fileRecord.id },
          data: { rowCount },
        })

        results.push({
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          recordCount: parsedRecords.length,
        })
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue with next file rather than failing the whole upload
      }
    }

    return NextResponse.json({ success: true, files: results })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}
