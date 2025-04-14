export interface FileRecord {
  id: string
  fileId: string
  fileName: string
  fileType: string
  sheetOrNode: string | null
  fieldName: string
  fieldValue: string
  rowNum: number | null
  parentContext: string | null
  fullPath: string | null
  context?: {
    rowData?: Record<string, any>
    xmlNode?: string
    warning?: string
  }
}

export interface ParsedRecord {
  id: string
  fileId: string
  sheetOrNode: string | null
  fieldName: string
  fieldValue: string
  rowNum: number | null
  parentContext: string | null
  fullPath: string | null
}

export interface CompanyData {
  name: string
  address: string
  phone: string
  email: string
  logo?: string
}

export interface QuotationData {
  documentNumber: string
  documentDate: string
  validUntil: string
  salesEmployee: string
  currency: string
  taxRate: number
  customer: Customer
  lineItems: LineItem[]
  notes: string
  termsAndConditions: string
  remarks: string
  bankDetails: string
  subtotal: number
  taxAmount: number
  totalAmount: number
}

export interface Customer {
  name: string
  address: string
  vatNumber: string
  tin: string
  phone: string
  email: string
}

export interface LineItem {
  id: string
  no: number
  description: string
  quantity: number
  unit: string
  price: number
  total: number
}
