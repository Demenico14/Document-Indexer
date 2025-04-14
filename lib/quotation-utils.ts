import type { LineItem } from "./types"

export function calculateTotals(lineItems: LineItem[], taxRate: number) {
  // Calculate subtotal
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)

  // Calculate tax amount
  const taxAmount = subtotal * (taxRate / 100)

  // Calculate total amount
  const totalAmount = subtotal + taxAmount

  return {
    subtotal,
    taxAmount,
    totalAmount,
  }
}
