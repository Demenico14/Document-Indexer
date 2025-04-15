import type { LineItem } from "./types"

export function calculateTotals(lineItems: LineItem[], markupRate: number) {
  // Calculate subtotal
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)

  // Calculate markup amount (but don't show it to the customer)
  const markupAmount = subtotal * (markupRate / 100)

  // Calculate total amount
  const totalAmount = subtotal + markupAmount

  return {
    subtotal,
    markupAmount, // This will be used internally but not shown
    totalAmount,
  }
}
