import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client/default.js"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get distinct file types
    const fileTypes = await prisma.file.findMany({
      select: {
        fileType: true,
      },
      distinct: ["fileType"],
    })

    // Get distinct field names (limit to 100 most common)
    const fieldNames = await prisma.parsedRecord.groupBy({
      by: ["fieldName"],
      _count: {
        fieldName: true,
      },
      orderBy: {
        _count: {
          fieldName: "desc",
        },
      },
      take: 100,
    })

    // Get distinct sheets/nodes (limit to 100)
    const sheets = await prisma.parsedRecord.groupBy({
      by: ["sheetOrNode"],
      _count: {
        sheetOrNode: true,
      },
      orderBy: {
        _count: {
          sheetOrNode: "desc",
        },
      },
      take: 100,
    })

    // Filter out empty sheet names
    const filteredSheets = sheets.filter((s) => s.sheetOrNode && s.sheetOrNode.trim() !== "").map((s) => s.sheetOrNode)

    // Create a map of sheet names to record counts
    const sheetCounts: Record<string, number> = {}
    sheets.forEach((sheet) => {
      if (sheet.sheetOrNode && sheet.sheetOrNode.trim() !== "") {
        sheetCounts[sheet.sheetOrNode] = sheet._count.sheetOrNode
      }
    })

    return NextResponse.json({
      fileTypes: fileTypes.map((f) => f.fileType),
      fieldNames: fieldNames.map((f) => f.fieldName),
      sheets: filteredSheets,
      sheetCounts,
    })
  } catch (error) {
    console.error("Error fetching filters:", error)
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
  }
}
