import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { parseExcel, parseCsv, parseXml } from "@/lib/file-parsers"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in the request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Received file:", file.name, "Size:", file.size, "Type:", file.type)

    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, "-")}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from(process.env.SUPABASE_BUCKET!).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET!).getPublicUrl(fileName)

    // Determine file type from extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    let fileType = "unknown"

    if (["xlsx", "xls"].includes(fileExtension)) {
      fileType = "xlsx"
    } else if (fileExtension === "csv") {
      fileType = "csv"
    } else if (fileExtension === "xml") {
      fileType = "xml"
    }

    // Store file metadata in database
    const fileRecord = await prisma.file.create({
      data: {
        filename: fileName,
        originalName: file.name,
        fileType: fileType,
        rowCount: 0,
      },
    })

    // Download the file from Supabase to parse it
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .download(fileName)

    if (downloadError) {
      console.error("Error downloading file from Supabase:", downloadError)
      return NextResponse.json({
        success: true,
        file: fileRecord,
        url: data.publicUrl,
        warning: "File uploaded but could not be parsed",
      })
    }

    // Parse the file based on its type
    let parseResult
    try {
      const arrayBuffer = await fileData.arrayBuffer()

      if (fileType === "xlsx") {
        parseResult = await parseExcel(arrayBuffer, fileRecord.id)
      } else if (fileType === "csv") {
        parseResult = await parseCsv(arrayBuffer, fileRecord.id)
      } else if (fileType === "xml") {
        parseResult = await parseXml(arrayBuffer, fileRecord.id)
      } else {
        throw new Error("Unsupported file type")
      }

      // Update the file record with the row count
      await prisma.file.update({
        where: { id: fileRecord.id },
        data: { rowCount: parseResult.rowCount },
      })

      // Store the parsed records in the database
      if (parseResult.records.length > 0) {
        // Convert records to the format expected by Prisma
        const recordsToCreate = parseResult.records.map((record: any) => ({
          fileId: record.fileId,
          sheetOrNode: record.sheetOrNode,
          fieldName: record.fieldName,
          fieldValue: record.fieldValue,
          rowNum: record.rowNum,
          parentContext: record.parentContext,
          fullPath: record.fullPath,
        }))

        await prisma.parsedRecord.createMany({
          data: recordsToCreate,
        })
      }

      return NextResponse.json({
        success: true,
        file: {
          ...fileRecord,
          rowCount: parseResult.rowCount,
        },
        url: data.publicUrl,
        recordsCount: parseResult.records.length,
      })
    } catch (parseError: any) {
      console.error("Error parsing file:", parseError)
      return NextResponse.json({
        success: true,
        file: fileRecord,
        url: data.publicUrl,
        warning: `File uploaded but could not be parsed: ${parseError.message}`,
      })
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process upload",
      },
      { status: 500 },
    )
  }
}
