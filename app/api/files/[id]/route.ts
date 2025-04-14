import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client/default.js"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: fileId } = await params

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error("Error fetching file:", error)
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before accessing its properties
    const { id: fileId } = await params

    // Delete all parsed records for this file
    await prisma.parsedRecord.deleteMany({
      where: { fileId },
    })

    // Delete the file record
    await prisma.file.delete({
      where: { id: fileId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
