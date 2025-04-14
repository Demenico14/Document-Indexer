"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { FileRecord } from "./types"

export async function generatePdf(records: FileRecord[], searchTerm: string): Promise<void> {
  // Create a new PDF document
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text("Document Indexer - Search Results", 14, 22)

  // Add metadata
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
  doc.text(`Search Term: ${searchTerm || "All records"}`, 14, 35)
  doc.text(`Results: ${records.length} records`, 14, 40)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Define the table columns
  const columns = [
    { header: "Field Name", dataKey: "fieldName" },
    { header: "Value", dataKey: "fieldValue" },
    { header: "File", dataKey: "fileName" },
    { header: "Sheet/Node", dataKey: "sheetOrNode" },
    { header: "Row/Path", dataKey: "rowPath" },
  ]

  // Prepare the data
  const data = records.map((record) => ({
    fieldName: record.fieldName,
    fieldValue: record.fieldValue,
    fileName: `${record.fileName} (${record.fileType.toUpperCase()})`,
    sheetOrNode: record.sheetOrNode,
    rowPath: record.rowNum ? `Row ${record.rowNum}` : record.fullPath,
  }))

  // Generate the table
  autoTable(doc, {
    startY: 45,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey as keyof typeof row])),
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 8,
    },
    columnStyles: {
      fieldValue: { cellWidth: 50 },
      rowPath: { cellWidth: 40 },
    },
    margin: { top: 45 },
    didDrawPage: (data) => {
      // Add page number at the bottom
      doc.setFontSize(8)
      doc.text(`Page ${doc.getNumberOfPages()}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
        align: "center",
      })
    },
  })

  // Save the PDF
  doc.save(`document-indexer-results-${new Date().toISOString().slice(0, 10)}.pdf`)
}
