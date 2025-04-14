import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client/default.js"
import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get system information
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uploadsDirectory: {
        path: path.join(process.cwd(), "uploads"),
        exists: fs.existsSync(path.join(process.cwd(), "uploads")),
        files: [] as string[],
      },
      logsDirectory: {
        path: path.join(process.cwd(), "logs"),
        exists: fs.existsSync(path.join(process.cwd(), "logs")),
        files: [] as string[],
      },
      database: {
        files: 0,
        records: 0,
        fileTypes: [] as string[],
        sheetCounts: {} as Record<string, number>,
      },
      xlsxVersion: XLSX.version,
    }

    // Get files in uploads directory
    if (diagnostics.uploadsDirectory.exists) {
      diagnostics.uploadsDirectory.files = fs.readdirSync(path.join(process.cwd(), "uploads"))
    }

    // Get files in logs directory
    if (diagnostics.logsDirectory.exists) {
      diagnostics.logsDirectory.files = fs
        .readdirSync(path.join(process.cwd(), "logs"))
        .filter((file) => file.startsWith("parsing-error"))
    }

    // Get database stats
    const fileCount = await prisma.file.count()
    const recordCount = await prisma.parsedRecord.count()

    // Get file types
    const fileTypes = await prisma.file.groupBy({
      by: ["fileType"],
      _count: {
        id: true,
      },
    })

    // Get sheet counts
    const sheetCounts = await prisma.parsedRecord.groupBy({
      by: ["sheetOrNode"],
      _count: {
        id: true,
      },
    })

    diagnostics.database.files = fileCount
    diagnostics.database.records = recordCount
    diagnostics.database.fileTypes = fileTypes.map((ft) => `${ft.fileType} (${ft._count.id})`)

    sheetCounts.forEach((sc) => {
      if (sc.sheetOrNode) {
        diagnostics.database.sheetCounts[sc.sheetOrNode] = sc._count.id
      }
    })

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Error generating diagnostics:", error)
    return NextResponse.json({ error: "Failed to generate diagnostics" }, { status: 500 })
  }
}
