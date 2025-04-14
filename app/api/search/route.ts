import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client/default.js"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")
    const fileType = searchParams.get("fileType") || ""
    const fieldName = searchParams.get("fieldName") || ""
    const sheet = searchParams.get("sheet") || ""

    // Get active sheets (can be multiple)
    const activeSheets = searchParams.getAll("activeSheets")

    // Calculate pagination
    const skip = (page - 1) * pageSize

    // Build where conditions
    const where: any = {}

    if (query) {
      where.OR = [
        { fieldName: { contains: query, mode: "insensitive" } },
        { fieldValue: { contains: query, mode: "insensitive" } },
        { parentContext: { contains: query, mode: "insensitive" } },
        { fullPath: { contains: query, mode: "insensitive" } },
      ]
    }

    if (fileType) {
      where.file = {
        fileType: {
          equals: fileType,
          mode: "insensitive",
        },
      }
    }

    if (fieldName) {
      where.fieldName = {
        equals: fieldName,
        mode: "insensitive",
      }
    }

    if (sheet) {
      where.sheetOrNode = {
        equals: sheet,
        mode: "insensitive",
      }
    } else if (activeSheets.length > 0) {
      // If specific sheets are selected, filter by them
      where.sheetOrNode = {
        in: activeSheets,
        mode: "insensitive",
      }
    }

    // Count total records
    const total = await prisma.parsedRecord.count({ where })

    // Get records
    const records = await prisma.parsedRecord.findMany({
      where,
      include: {
        file: {
          select: {
            originalName: true,
            fileType: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: [{ sheetOrNode: "asc" }, { rowNum: "asc" }, { id: "asc" }],
    })

    // Transform records
    const transformedRecords = records.map((record) => ({
      id: record.id,
      fileId: record.fileId,
      fileName: record.file.originalName,
      fileType: record.file.fileType,
      sheetOrNode: record.sheetOrNode,
      fieldName: record.fieldName,
      fieldValue: record.fieldValue,
      rowNum: record.rowNum,
      parentContext: record.parentContext,
      fullPath: record.fullPath,
    }))

    return NextResponse.json({
      records: transformedRecords,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error("Error searching records:", error)
    return NextResponse.json({ error: "Failed to search records" }, { status: 500 })
  }
}
