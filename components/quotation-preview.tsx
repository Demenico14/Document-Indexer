"use client"

import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { QuotationData, CompanyData } from "@/lib/types"

interface QuotationPreviewProps {
  quotationData: QuotationData
  companyData: CompanyData
}

export function QuotationPreview({ quotationData, companyData }: QuotationPreviewProps) {
  return (
    <Card className="p-8 bg-white" id="quotation-preview">
      {/* Company Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div className="flex-1">
          {companyData.logo && (
            <img src={companyData.logo || "/placeholder.svg"} alt={companyData.name} className="h-16 mb-4" />
          )}
          <h1 className="text-xl font-bold">{companyData.name}</h1>
          <div className="text-sm whitespace-pre-line">{companyData.address}</div>
          <div className="text-sm mt-1">Phone No: {companyData.phone}</div>
          <div className="text-sm">Email: {companyData.email}</div>
        </div>

        <div className="mt-6 md:mt-0 text-right">
          <h2 className="text-xl font-bold uppercase mb-4">Sales Quotation</h2>
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="text-right font-medium">Document Number</div>
            <div className="text-left">{quotationData.documentNumber}</div>
            <div className="text-right font-medium">Document Date</div>
            <div className="text-left">{formatDate(quotationData.documentDate)}</div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="text-sm whitespace-pre-line font-medium">
            {quotationData.customer.name}
            <br />
            {quotationData.customer.address}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 text-sm">
          <div className="font-medium">VAT Number</div>
          <div>{quotationData.customer.vatNumber}</div>
          <div className="font-medium">TIN</div>
          <div>{quotationData.customer.tin}</div>
          <div className="font-medium">Sales Employee</div>
          <div>{quotationData.salesEmployee}</div>
          <div className="font-medium">Currency</div>
          <div>{quotationData.currency}</div>
          <div className="font-medium">Customer Phone No</div>
          <div>{quotationData.customer.phone}</div>
          <div className="font-medium">Customer Email</div>
          <div>{quotationData.customer.email}</div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">No.</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Unit</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.lineItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">{item.no}</td>
                <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{item.unit}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{item.price.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {quotationData.notes && <div className="mb-8 text-sm whitespace-pre-line">{quotationData.notes}</div>}

      {/* Terms and Conditions */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">Terms and Conditions</h3>
        <div className="text-sm whitespace-pre-line">{quotationData.termsAndConditions}</div>
        <div className="mt-2 text-sm">Quotation Valid Until {formatDate(quotationData.validUntil)}</div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Subtotal</div>
            <div className="text-right">
              {quotationData.currency} {quotationData.subtotal.toFixed(2)}
            </div>
            {/* Markup is hidden from the UI */}
            <div className="font-bold text-lg">Total Amount</div>
            <div className="text-right font-bold text-lg">
              {quotationData.currency} {quotationData.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Remarks and Bank Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-2">Remarks</h3>
          <div className="text-sm whitespace-pre-line">{quotationData.remarks}</div>
        </div>

        <div>
          <h3 className="font-bold mb-2">Bank Details</h3>
          <div className="text-sm whitespace-pre-line">{quotationData.bankDetails}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">Page 1 of 1</div>
    </Card>
  )
}
