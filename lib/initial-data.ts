import type { QuotationData, CompanyData } from "./types"

export const initialQuotationData: QuotationData = {
  documentNumber: "1011",
  documentDate: "2025-03-21",
  validUntil: "2025-04-21",
  salesEmployee: "Tafadzwa Gwena",
  currency: "USD",
  taxRate: 15,
  customer: {
    name: "Ncube Burrow Engineering",
    address: "19 Churchill Road\nAlexandra Park\nHarare\nZIMBABWE",
    vatNumber: "220176927",
    tin: "2000150074",
    phone: "",
    email: "",
  },
  lineItems: [
    {
      id: "item-1",
      no: 1,
      description: "500GB SSD",
      quantity: 1,
      unit: "Each",
      price: 52.17,
      total: 52.17,
    },
    {
      id: "item-2",
      no: 2,
      description: "Software Installation + Confugration",
      quantity: 1,
      unit: "Each",
      price: 34.78,
      total: 34.78,
    },
    {
      id: "item-3",
      no: 3,
      description: "General Service",
      quantity: 1,
      unit: "Each",
      price: 17.4,
      total: 17.4,
    },
  ],
  notes:
    "-Software Configurations for AutoCAD, Antivirus, Drivers and Windows 11 OS\n- General Service includes CMOS Replacement",
  termsAndConditions:
    "1. Errors and Omissions Exempted\n2. Delivery - 30 days for day of Order placement\n3. Payment Terms - Upon Delivery",
  remarks: "",
  bankDetails:
    "Account Name: Distitron Investments\nBank Name: Nedbank\nAccount Number: 11991013530\nBranch: Borrowdale",
  subtotal: 104.35,
  taxAmount: 15.65,
  totalAmount: 120.0,
}

export const initialCompanyData: CompanyData = {
  name: "Strategic Information Systems",
  address: "Suite 2, House West Office Block\nWestgate Complex, Harare, Zimbabwe",
  phone: "+263 24 2369020/2",
  email: "sales@sis.co.zw",
}
