import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getFilePreview } from "@/lib/file-preview"

const prisma = new PrismaClient()

// Update the GET function to accept a sheet parameter
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: fileId } = await params

    // Get the sheet parameter from the URL
    const searchParams = request.nextUrl.searchParams
    const sheetName = searchParams.get("sheet")

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const preview = await getFilePreview(file, sheetName || undefined)

    return NextResponse.json(preview)
  } catch (error) {
    console.error("Error fetching file preview:", error)
    return NextResponse.json({ error: "Failed to fetch file preview" }, { status: 500 })
  }
}
