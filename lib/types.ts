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
  markupRate: number // Changed from taxRate to markupRate
  customer: Customer
  lineItems: LineItem[]
  notes: string
  termsAndConditions: string
  remarks: string
  bankDetails: string
  subtotal: number
  markupAmount: number // Changed from taxAmount to markupAmount
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
  category?: string
  brand?: string
  model?: string
  specs?: {
    display?: string
    processor?: string
    storage?: string
    graphics?: string
    connectivity?: string
    security?: string
    battery?: string
    memory?: string
    camera?: string
    audio?: string
    dimensions?: string
    weight?: string
    operatingSystem?: string
    ports?: string
    wireless?: string
    [key: string]: string | undefined
  }
}

export interface TechSpecs {
  display?: string
  processor?: string
  storage?: string
  graphics?: string
  connectivity?: string
  security?: string
  battery?: string
  memory?: string
  camera?: string
  audio?: string
  dimensions?: string
  weight?: string
  operatingSystem?: string
  ports?: string
  wireless?: string
  [key: string]: string | undefined
}

export interface ExtractedProduct {
  name?: string
  model?: string
  brand?: string
  price?: number
  currency?: string
  specs: TechSpecs
  category?: string
  description?: string
}
