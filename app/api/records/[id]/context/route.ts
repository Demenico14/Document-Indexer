import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getRecordContext } from "@/lib/record-context"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: recordId } = await params

    const record = await prisma.parsedRecord.findUnique({
      where: { id: recordId },
      include: {
        file: true,
      },
    })

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    const context = await getRecordContext(record)

    return NextResponse.json(context)
  } catch (error) {
    console.error("Error fetching record context:", error)
    return NextResponse.json({ error: "Failed to fetch record context" }, { status: 500 })
  }
}
