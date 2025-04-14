"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { FileRecord } from "./types"

export async function generateQuotationPdf(
  records: FileRecord[],
  recordContexts: Record<string, any>,
  title: string,
): Promise<void> {
  try {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFillColor(40, 40, 40)
    doc.rect(0, 0, doc.internal.pageSize.width, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Document Quotation", 14, 20)

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Add quotation details
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Quotation Details", 14, 40)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Quotation #: Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      14,
      48,
    )
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 54)
    doc.text(`Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 14, 60)
    doc.text(`Total Records: ${records.length}`, 14, 66)

    let yPosition = 80

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const context = recordContexts[record.id]

      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 40) {
        doc.addPage()
        yPosition = 20
      }

      // Add record header
      doc.setFillColor(240, 240, 240)
      doc.rect(14, yPosition, doc.internal.pageSize.width - 28, 8, "F")
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(`Record ${i + 1}: ${record.fieldName} = ${record.fieldValue}`, 16, yPosition + 5.5)

      yPosition += 15

      // Add record metadata
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`File: ${record.fileName} (${record.fileType.toUpperCase()})`, 14, yPosition)
      yPosition += 5
      doc.text(`Sheet/Node: ${record.sheetOrNode}`, 14, yPosition)
      yPosition += 5
      doc.text(`Location: ${record.rowNum ? `Row ${record.rowNum}` : record.fullPath || "Unknown"}`, 14, yPosition)
      yPosition += 10

      // Add context data
      if (context) {
        if (record.fileType.toLowerCase() === "xml" && context.xmlNode) {
          // For XML records
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          doc.text("XML Context:", 14, yPosition)
          yPosition += 6

          // Format XML for display
          const xmlText = context.xmlNode.replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 1000) // Limit length to avoid huge PDFs

          doc.setFontSize(7)
          doc.setFont("courier", "normal")

          // Split XML into lines and add to PDF
          const xmlLines = xmlText.split("\n")
          for (const line of xmlLines) {
            if (yPosition > doc.internal.pageSize.height - 20) {
              doc.addPage()
              yPosition = 20
            }

            // Limit line length
            const maxLineLength = 100
            if (line.length > maxLineLength) {
              doc.text(line.substring(0, maxLineLength) + "...", 14, yPosition)
            } else {
              doc.text(line, 14, yPosition)
            }

            yPosition += 4
          }
        } else if (context.rowData) {
          // For spreadsheet records
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          doc.text("Row Data:", 14, yPosition)
          yPosition += 8

          // Use autoTable for row data
          const tableData = Object.entries(context.rowData).map(([key, value]) => [
            key,
            value !== null && value !== undefined ? String(value) : "",
          ])

          autoTable(doc, {
            startY: yPosition,
            head: [["Field", "Value"]],
            body: tableData,
            theme: "grid",
            headStyles: {
              fillColor: [230, 230, 230],
              textColor: [0, 0, 0],
              fontStyle: "bold",
            },
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: "auto" },
            },
            didDrawCell: (data) => {
              // Highlight the cell if it matches the record's field name
              if (data.section === "body" && data.column.index === 0 && data.cell.raw === record.fieldName) {
                doc.setFillColor(255, 255, 200)
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F")
                doc.setTextColor(0, 0, 0)
                doc.setFontSize(8)
                doc.setFont("helvetica", "bold")
                doc.text(String(data.cell.raw), data.cell.x + 2, data.cell.y + 5)
              }
            },
          })

          // Update yPosition after the table
          yPosition = (doc as any).lastAutoTable.finalY + 10
        }
      }

      yPosition += 10
    }

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Footer line
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(
        14,
        doc.internal.pageSize.height - 20,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 20,
      )

      // Footer text
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Page ${i} of ${pageCount} | Document Quotation | Generated on ${new Date().toLocaleDateString()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      )
    }

    // Save the PDF
    doc.save(`document-quotation-${new Date().toISOString().slice(0, 10)}.pdf`)

    console.log("PDF generated successfully")
    return Promise.resolve()
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
