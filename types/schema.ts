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
  }
  