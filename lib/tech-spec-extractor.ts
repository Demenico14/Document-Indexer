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

// Enhanced specification patterns with more precise matching
const SPEC_PATTERNS = {
  display: {
    patterns: [
      /(\d+\.?\d*)\s*[""′]\s*(display|screen|monitor|lcd|led|oled)/i,
      /(\d+\.?\d*)\s*inch\s*(display|screen|monitor)/i,
      /(\d+\s*x\s*\d+)\s*(resolution|pixels?)/i,
      /(fhd|uhd|4k|2k|1080p|720p|qhd)/i,
      /(\d+)\s*nits?\s*(brightness)?/i,
      /(ips|tn|va|oled|amoled)\s*(panel|display)/i,
      /(touchscreen|touch\s*screen)/i,
      /(anti[- ]?glare|matte|glossy)/i,
    ],
    keywords: [
      "display",
      "screen",
      "monitor",
      "lcd",
      "led",
      "oled",
      "resolution",
      "inch",
      "brightness",
      "panel",
      "touchscreen",
    ],
  },
  processor: {
    patterns: [
      /(intel|amd)\s+(core\s+)?(i[3579]|ryzen\s*[3579]|celeron|pentium|athlon)\s*[-\s]*(\w+)?/i,
      /(snapdragon|exynos|apple\s+a\d+|mediatek)\s*(\d+)?/i,
      /(\d+\.?\d*)\s*(ghz|mhz)\s*(processor|cpu)?/i,
      /(\d+)[-\s]*(core|thread)\s*(processor|cpu)?/i,
      /(quad[- ]?core|dual[- ]?core|octa[- ]?core|hexa[- ]?core)/i,
    ],
    keywords: ["processor", "cpu", "intel", "amd", "core", "ghz", "snapdragon", "chipset"],
  },
  storage: {
    patterns: [
      /(\d+)\s*(gb|tb)\s*(ssd|hdd|emmc|ufs|nvme)/i,
      /(\d+)\s*(gb|tb)\s*(storage|disk|drive)/i,
      /(ssd|hdd|solid\s*state|hard\s*drive)\s*(\d+)\s*(gb|tb)/i,
      /(nvme|sata|pcie)\s*(ssd|storage)/i,
    ],
    keywords: ["storage", "ssd", "hdd", "disk", "drive", "nvme", "emmc", "gb", "tb"],
  },
  memory: {
    patterns: [
      /(\d+)\s*(gb|mb)\s*(ram|memory|ddr[345]?)/i,
      /(ddr[345])\s*[-\s]*(\d+)\s*(gb|mb)?/i,
      /(\d+)\s*(gb|mb)\s*(lpddr[345])/i,
    ],
    keywords: ["ram", "memory", "ddr", "lpddr", "gb", "mb"],
  },
  graphics: {
    patterns: [
      /(nvidia|amd|intel)\s+(geforce\s+)?(gtx|rtx|radeon|iris|uhd)\s*(\w+)?/i,
      /(integrated|dedicated)\s*(graphics|gpu)/i,
      /(\d+)\s*(gb|mb)\s*(vram|graphics\s*memory)/i,
    ],
    keywords: ["graphics", "gpu", "nvidia", "amd", "geforce", "radeon", "integrated", "dedicated"],
  },
  battery: {
    patterns: [
      /(\d+)\s*(mah|wh|whr)\s*(battery)?/i,
      /(\d+)\s*(hours?|hrs?)\s*(battery\s*life|usage)/i,
      /(fast\s*charg|wireless\s*charg|quick\s*charg)/i,
      /(\d+)\s*w\s*(charg|adapter)/i,
    ],
    keywords: ["battery", "mah", "wh", "hours", "charging", "power"],
  },
  connectivity: {
    patterns: [
      /(wifi\s*[6e]?|802\.11\s*[abgnacax]+)/i,
      /(bluetooth\s*[\d.]*)/i,
      /(5g|4g|lte|3g)\s*(connectivity)?/i,
      /(ethernet|lan|rj45)/i,
      /(nfc|near\s*field)/i,
    ],
    keywords: ["wifi", "bluetooth", "5g", "4g", "lte", "ethernet", "nfc", "connectivity"],
  },
  ports: {
    patterns: [
      /(usb\s*[abc]?[\d.]*|usb[-\s]*c|thunderbolt\s*[\d]*)/i,
      /(hdmi\s*[\d.]*|displayport|vga|dvi)/i,
      /(audio\s*jack|headphone\s*jack|3\.5mm)/i,
      /(sd\s*card|micro\s*sd|tf\s*card)/i,
    ],
    keywords: ["usb", "hdmi", "thunderbolt", "audio jack", "sd card", "ports"],
  },
  operatingSystem: {
    patterns: [/(windows\s*\d*|macos|mac\s*os|linux|ubuntu|chrome\s*os)/i, /(android\s*\d*|ios\s*\d*)/i],
    keywords: ["windows", "macos", "linux", "android", "ios", "chrome os", "operating system"],
  },
  camera: {
    patterns: [
      /(\d+)\s*(mp|megapixel)\s*(camera|sensor)/i,
      /(front|rear|back)\s*camera\s*(\d+)\s*(mp)?/i,
      /(autofocus|optical\s*zoom|digital\s*zoom)/i,
    ],
    keywords: ["camera", "mp", "megapixel", "autofocus", "zoom"],
  },
  dimensions: {
    patterns: [
      /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(mm|cm|inch)/i,
      /(dimensions?|size)\s*:?\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/i,
    ],
    keywords: ["dimensions", "size", "length", "width", "height", "mm", "cm"],
  },
  weight: {
    patterns: [/(\d+\.?\d*)\s*(kg|g|lb|lbs|pound|ounce|oz)/i, /(weight|weighs?)\s*:?\s*(\d+\.?\d*)\s*(kg|g|lb)/i],
    keywords: ["weight", "kg", "gram", "pound", "lb", "oz"],
  },
}

// Brand recognition patterns
const BRAND_PATTERNS = [
  /\b(apple|samsung|google|huawei|xiaomi|oneplus|oppo|vivo|realme|nokia)\b/i,
  /\b(dell|hp|lenovo|asus|acer|msi|alienware|razer|surface|macbook)\b/i,
  /\b(intel|amd|nvidia|qualcomm|mediatek)\b/i,
]

// Model recognition patterns
const MODEL_PATTERNS = [
  /\b(iphone\s*\d+|galaxy\s*[a-z]*\d+|pixel\s*\d+|mate\s*\d+)\b/i,
  /\b(ideapad|thinkpad|pavilion|inspiron|vivobook|zenbook|macbook)\s*[\w\d]*\b/i,
  /\b([a-z]+\d+[a-z]*|\d+[a-z]+\d*)\b/i,
]

export function extractTechSpecs(records: any[]): ExtractedProduct[] {
  const products: ExtractedProduct[] = []
  const productGroups = groupRecordsByProduct(records)

  for (const group of productGroups) {
    const product = analyzeProductGroup(group)
    if (product && product.specs && Object.keys(product.specs).length > 0) {
      products.push(product)
    }
  }

  return products
}

function groupRecordsByProduct(records: any[]): any[][] {
  // Group records by sheet/node or by proximity
  const groups: { [key: string]: any[] } = {}

  for (const record of records) {
    const groupKey = record.sheetOrNode || record.parentContext || "default"
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(record)
  }

  return Object.values(groups)
}

function analyzeProductGroup(records: any[]): ExtractedProduct | null {
  const product: ExtractedProduct = {
    specs: {},
  }

  // First pass: collect all text content
  const allText = records.map((r) => `${r.fieldName || ""} ${r.fieldValue || ""}`).join(" ")

  // Extract product information
  extractProductInfo(product, records, allText)

  // Extract technical specifications with improved logic
  extractSpecificationsAdvanced(product.specs, records, allText)

  // Extract price information
  extractPriceInfo(product, records)

  // Post-process and clean up
  cleanupProductData(product)

  return product
}

function extractProductInfo(product: ExtractedProduct, records: any[], allText: string) {
  // Extract brand
  for (const pattern of BRAND_PATTERNS) {
    const match = allText.match(pattern)
    if (match && !product.brand) {
      product.brand = capitalizeFirst(match[1])
      break
    }
  }

  // Extract model
  for (const pattern of MODEL_PATTERNS) {
    const match = allText.match(pattern)
    if (match && !product.model) {
      product.model = match[1]
      break
    }
  }

  // Extract name from records
  for (const record of records) {
    const fieldName = record.fieldName?.toLowerCase() || ""
    const fieldValue = record.fieldValue?.toString() || ""

    if (fieldName.includes("name") || fieldName.includes("title") || fieldName.includes("product")) {
      if (!product.name && fieldValue.length > 0 && fieldValue.length < 100) {
        product.name = fieldValue
      }
    }

    if (fieldName.includes("category") || fieldName.includes("type")) {
      if (!product.category && fieldValue.length > 0 && fieldValue.length < 50) {
        product.category = fieldValue
      }
    }
  }
}

function extractSpecificationsAdvanced(specs: TechSpecs, records: any[], allText: string) {
  // Process each record individually for better precision
  for (const record of records) {
    const fieldName = record.fieldName?.toLowerCase() || ""
    const fieldValue = record.fieldValue?.toString() || ""
    const combinedText = `${fieldName} ${fieldValue}`.toLowerCase()

    // Skip empty or very short values
    if (!fieldValue || fieldValue.length < 2) continue

    // Try to match against each specification category
    for (const [specKey, specConfig] of Object.entries(SPEC_PATTERNS)) {
      // Skip if we already have a good value for this spec
      if (specs[specKey] && specs[specKey]!.length > 10) continue

      let matched = false
      let extractedValue = ""

      // Try pattern matching first (more precise)
      for (const pattern of specConfig.patterns) {
        const match = combinedText.match(pattern)
        if (match) {
          // Extract the most relevant part of the match
          extractedValue = extractRelevantValue(match, fieldValue, specKey)
          if (extractedValue && extractedValue.length > 2) {
            matched = true
            break
          }
        }
      }

      // If no pattern match, try keyword matching with context
      if (!matched) {
        const keywordMatches = specConfig.keywords.filter((keyword) => combinedText.includes(keyword.toLowerCase()))

        if (keywordMatches.length > 0) {
          // Only use keyword matching if the field seems relevant
          if (isRelevantForSpec(fieldName, fieldValue, specKey)) {
            extractedValue = cleanSpecValue(fieldValue, specKey)
            matched = true
          }
        }
      }

      // Assign the extracted value if it's good quality
      if (matched && extractedValue && isGoodSpecValue(extractedValue, specKey)) {
        if (!specs[specKey] || extractedValue.length > specs[specKey]!.length) {
          specs[specKey] = extractedValue
        }
      }
    }
  }

  // Second pass: try to extract from combined text for missing specs
  for (const [specKey, specConfig] of Object.entries(SPEC_PATTERNS)) {
    if (specs[specKey]) continue // Skip if already found

    for (const pattern of specConfig.patterns) {
      const match = allText.match(pattern)
      if (match) {
        const extractedValue = extractRelevantValue(match, allText, specKey)
        if (extractedValue && isGoodSpecValue(extractedValue, specKey)) {
          specs[specKey] = extractedValue
          break
        }
      }
    }
  }
}

function extractRelevantValue(match: RegExpMatchArray, originalText: string, specKey: string): string {
  if (!match) return ""

  // For different spec types, extract the most relevant part
  switch (specKey) {
    case "display":
      // Look for size, resolution, or panel type
      if (match[0].match(/\d+\.?\d*\s*[""′]/)) {
        return match[0] // Screen size
      }
      if (match[0].match(/\d+\s*x\s*\d+/)) {
        return match[0] // Resolution
      }
      if (match[0].match(/(fhd|uhd|4k|ips|tn|oled)/i)) {
        return match[0] // Display type
      }
      break

    case "processor":
      // Extract processor model and speed
      if (match[0].match(/(intel|amd).*(i[3579]|ryzen)/i)) {
        return match[0]
      }
      if (match[0].match(/\d+\.?\d*\s*(ghz|mhz)/i)) {
        return match[0]
      }
      break

    case "storage":
    case "memory":
      // Extract capacity
      if (match[0].match(/\d+\s*(gb|tb|mb)/i)) {
        return match[0]
      }
      break

    case "battery":
      // Extract capacity or life
      if (match[0].match(/\d+\s*(mah|wh|hours?)/i)) {
        return match[0]
      }
      break

    default:
      return match[0]
  }

  return match[0]
}

function isRelevantForSpec(fieldName: string, fieldValue: string, specKey: string): boolean {
  const name = fieldName.toLowerCase()
  const value = fieldValue.toLowerCase()

  // Check if the field name or value context makes sense for this spec
  switch (specKey) {
    case "display":
      return (
        name.includes("display") || name.includes("screen") || value.includes("inch") || value.includes("resolution")
      )

    case "processor":
      return (
        name.includes("processor") ||
        name.includes("cpu") ||
        value.includes("intel") ||
        value.includes("amd") ||
        value.includes("ghz")
      )

    case "storage":
      return (
        name.includes("storage") ||
        name.includes("disk") ||
        ((value.includes("gb") || value.includes("tb")) && (value.includes("ssd") || value.includes("hdd")))
      )

    case "memory":
      return (
        name.includes("memory") ||
        name.includes("ram") ||
        value.includes("ddr") ||
        (value.includes("gb") && value.includes("ram"))
      )

    case "graphics":
      return (
        name.includes("graphics") ||
        name.includes("gpu") ||
        value.includes("nvidia") ||
        value.includes("amd") ||
        value.includes("integrated")
      )

    case "battery":
      return name.includes("battery") || name.includes("power") || value.includes("mah") || value.includes("hours")

    default:
      return true
  }
}

function isGoodSpecValue(value: string, specKey: string): boolean {
  if (!value || value.length < 2 || value.length > 200) return false

  // Avoid generic or repeated values
  const lowerValue = value.toLowerCase()

  // Skip if it's just a brand name or model without specs
  if (lowerValue.match(/^(apple|samsung|dell|hp|lenovo|asus)$/i)) return false

  // Skip if it's the same as other common non-spec values
  if (lowerValue.match(/^(yes|no|true|false|n\/a|tbd)$/i)) return false

  // For specific specs, do additional validation
  switch (specKey) {
    case "display":
      return (
        lowerValue.includes("inch") ||
        lowerValue.includes("x") ||
        lowerValue.includes("fhd") ||
        lowerValue.includes("resolution")
      )

    case "processor":
      return (
        lowerValue.includes("intel") ||
        lowerValue.includes("amd") ||
        lowerValue.includes("ghz") ||
        lowerValue.includes("core")
      )

    case "storage":
      return (
        (lowerValue.includes("gb") || lowerValue.includes("tb")) &&
        (lowerValue.includes("ssd") || lowerValue.includes("hdd") || lowerValue.includes("storage"))
      )

    case "memory":
      return lowerValue.includes("gb") && (lowerValue.includes("ram") || lowerValue.includes("ddr"))

    default:
      return true
  }
}

function cleanSpecValue(value: string, specKey: string): string {
  // Clean up the specification value
  let cleaned = value.trim()

  // Remove common prefixes that don't add value
  cleaned = cleaned.replace(/^(specification|spec|feature):\s*/i, "")

  // Limit length for readability
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + "..."
  }

  return cleaned
}

function extractPriceInfo(product: ExtractedProduct, records: any[]) {
  const priceKeywords = ["price", "cost", "amount", "total", "msrp", "retail"]

  for (const record of records) {
    const fieldName = record.fieldName?.toLowerCase() || ""
    const fieldValue = record.fieldValue?.toString() || ""

    if (priceKeywords.some((keyword) => fieldName.includes(keyword))) {
      // Try to extract numeric price
      const priceMatch = fieldValue.match(/[\d,]+\.?\d*/)
      if (priceMatch) {
        const price = Number.parseFloat(priceMatch[0].replace(/,/g, ""))
        if (!isNaN(price) && price > 0) {
          product.price = price
        }
      }

      // Try to extract currency
      const currencyMatch = fieldValue.match(/\$|€|£|¥|USD|EUR|GBP|JPY/i)
      if (currencyMatch) {
        product.currency = currencyMatch[0].toUpperCase()
      }
    }
  }
}

function cleanupProductData(product: ExtractedProduct) {
  // Remove empty specs
  Object.keys(product.specs).forEach((key) => {
    if (!product.specs[key] || product.specs[key]?.trim() === "") {
      delete product.specs[key]
    }
  })

  // Generate description from specs if missing
  if (!product.description && Object.keys(product.specs).length > 0) {
    const specEntries = Object.entries(product.specs)
      .filter(([_, value]) => value && value.length < 100)
      .slice(0, 5)
      .map(([key, value]) => `${capitalizeFirst(key)}: ${value}`)

    if (specEntries.length > 0) {
      product.description = specEntries.join("\n")
    }
  }

  // Set default currency if price exists but no currency
  if (product.price && !product.currency) {
    product.currency = "USD"
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Enhanced function to create structured line items from extracted products
export function createStructuredLineItems(products: ExtractedProduct[]): any[] {
  return products.map((product, index) => {
    // Create a clean, concise description
    let description = ""

    // Product title (brand + name/model)
    const titleParts = []
    if (product.brand) titleParts.push(product.brand)
    if (product.name) titleParts.push(product.name)
    else if (product.model) titleParts.push(product.model)

    if (titleParts.length > 0) {
      description = titleParts.join(" ")
    }

    // Fallback if no meaningful description
    if (!description.trim()) {
      description = `${product.brand || ""} ${product.name || product.model || "Product"}`.trim()
      if (product.category) {
        description += ` - ${product.category}`
      }
    }

    return {
      id: `structured-item-${Date.now()}-${index}`,
      no: index + 1,
      description: description.trim(),
      quantity: 1,
      unit: "Each",
      price: product.price || 0,
      total: product.price || 0,
      category: product.category,
      brand: product.brand,
      model: product.model,
      specs: product.specs,
    }
  })
}
