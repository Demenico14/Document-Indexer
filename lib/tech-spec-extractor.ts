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

// Keywords for different specification categories
const SPEC_CATEGORIES = {
  display: [
    "display",
    "screen",
    "monitor",
    "lcd",
    "led",
    "oled",
    "resolution",
    "inch",
    "diagonal",
    "brightness",
    "contrast",
    "refresh rate",
    "panel",
    "touchscreen",
    "retina",
  ],
  processor: [
    "processor",
    "cpu",
    "chipset",
    "core",
    "ghz",
    "mhz",
    "intel",
    "amd",
    "snapdragon",
    "apple",
    "a15",
    "a16",
    "i3",
    "i5",
    "i7",
    "i9",
    "ryzen",
    "celeron",
    "pentium",
  ],
  storage: [
    "storage",
    "ssd",
    "hdd",
    "hard drive",
    "disk",
    "gb",
    "tb",
    "nvme",
    "sata",
    "emmc",
    "ufs",
    "flash",
    "capacity",
    "internal storage",
  ],
  graphics: [
    "graphics",
    "gpu",
    "video card",
    "nvidia",
    "amd",
    "intel",
    "geforce",
    "radeon",
    "integrated",
    "dedicated",
    "vram",
    "cuda",
    "directx",
    "opengl",
  ],
  connectivity: [
    "connectivity",
    "wifi",
    "bluetooth",
    "ethernet",
    "lan",
    "wan",
    "5g",
    "4g",
    "lte",
    "nfc",
    "usb",
    "hdmi",
    "thunderbolt",
    "usb-c",
    "lightning",
  ],
  security: [
    "security",
    "fingerprint",
    "face id",
    "touch id",
    "biometric",
    "encryption",
    "secure boot",
    "tpm",
    "firewall",
    "antivirus",
    "password",
    "pin",
  ],
  battery: [
    "battery",
    "mah",
    "wh",
    "hours",
    "life",
    "charging",
    "fast charge",
    "wireless charging",
    "power",
    "adapter",
    "standby",
    "talk time",
    "usage time",
  ],
  memory: [
    "memory",
    "ram",
    "ddr",
    "lpddr",
    "dimm",
    "sodimm",
    "mb",
    "gb",
    "expandable",
    "slot",
    "dual channel",
    "speed",
  ],
  camera: [
    "camera",
    "megapixel",
    "mp",
    "lens",
    "aperture",
    "zoom",
    "optical",
    "digital",
    "flash",
    "autofocus",
    "video",
    "4k",
    "1080p",
    "front",
    "rear",
    "selfie",
  ],
  audio: [
    "audio",
    "speaker",
    "microphone",
    "headphone",
    "jack",
    "stereo",
    "surround",
    "dolby",
    "dts",
    "bass",
    "treble",
    "equalizer",
    "noise cancellation",
  ],
  dimensions: [
    "dimensions",
    "size",
    "length",
    "width",
    "height",
    "depth",
    "mm",
    "cm",
    "inch",
    "compact",
    "slim",
    "thickness",
  ],
  weight: ["weight", "kg", "g", "gram", "kilogram", "lb", "pound", "ounce", "oz", "light", "heavy"],
  operatingSystem: [
    "operating system",
    "os",
    "windows",
    "macos",
    "linux",
    "android",
    "ios",
    "chrome os",
    "ubuntu",
    "version",
    "build",
    "update",
  ],
  ports: [
    "ports",
    "usb",
    "hdmi",
    "vga",
    "dvi",
    "displayport",
    "audio jack",
    "ethernet",
    "thunderbolt",
    "sd card",
    "micro sd",
    "sim card",
  ],
  wireless: [
    "wireless",
    "wifi",
    "bluetooth",
    "nfc",
    "infrared",
    "zigbee",
    "z-wave",
    "802.11",
    "ac",
    "ax",
    "n",
    "g",
    "dual band",
    "tri band",
  ],
}

// Price-related keywords
const PRICE_KEYWORDS = [
  "price",
  "cost",
  "amount",
  "total",
  "subtotal",
  "msrp",
  "retail",
  "wholesale",
  "discount",
  "sale",
  "offer",
  "deal",
  "$",
  "€",
  "£",
  "¥",
  "usd",
  "eur",
  "gbp",
]

// Product identification keywords
const PRODUCT_KEYWORDS = {
  name: ["name", "title", "product", "item", "model name"],
  model: ["model", "model number", "part number", "sku", "product code"],
  brand: ["brand", "manufacturer", "company", "make", "vendor"],
  category: ["category", "type", "class", "family", "series"],
}

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

  for (const record of records) {
    const fieldName = record.fieldName?.toLowerCase() || ""
    const fieldValue = record.fieldValue?.toString() || ""

    // Skip empty values
    if (!fieldValue.trim()) continue

    // Extract product information
    extractProductInfo(product, fieldName, fieldValue)

    // Extract technical specifications
    extractSpecifications(product.specs, fieldName, fieldValue)

    // Extract price information
    extractPriceInfo(product, fieldName, fieldValue)
  }

  // Post-process and clean up the product data
  cleanupProductData(product)

  return product
}

function extractProductInfo(product: ExtractedProduct, fieldName: string, fieldValue: string) {
  // Check for product name
  if (PRODUCT_KEYWORDS.name.some((keyword) => fieldName.includes(keyword))) {
    product.name = fieldValue
  }

  // Check for model
  if (PRODUCT_KEYWORDS.model.some((keyword) => fieldName.includes(keyword))) {
    product.model = fieldValue
  }

  // Check for brand
  if (PRODUCT_KEYWORDS.brand.some((keyword) => fieldName.includes(keyword))) {
    product.brand = fieldValue
  }

  // Check for category
  if (PRODUCT_KEYWORDS.category.some((keyword) => fieldName.includes(keyword))) {
    product.category = fieldValue
  }
}

function extractSpecifications(specs: TechSpecs, fieldName: string, fieldValue: string) {
  // Check each specification category
  for (const [category, keywords] of Object.entries(SPEC_CATEGORIES)) {
    if (keywords.some((keyword) => fieldName.includes(keyword) || fieldValue.toLowerCase().includes(keyword))) {
      // If we already have a value for this category, append to it
      if (specs[category]) {
        specs[category] += ` | ${fieldValue}`
      } else {
        specs[category] = fieldValue
      }
      break // Only assign to the first matching category
    }
  }

  // Special handling for common patterns
  handleSpecialPatterns(specs, fieldName, fieldValue)
}

function handleSpecialPatterns(specs: TechSpecs, fieldName: string, fieldValue: string) {
  const value = fieldValue.toLowerCase()

  // Handle display sizes (e.g., "15.6 inch", "13.3\"")
  if (/\d+\.?\d*\s*(inch|"|in|cm)/.test(value) && !specs.display) {
    specs.display = fieldValue
  }

  // Handle storage sizes (e.g., "512GB SSD", "1TB HDD")
  if (/\d+\s*(gb|tb)\s*(ssd|hdd|storage)/.test(value) && !specs.storage) {
    specs.storage = fieldValue
  }

  // Handle memory sizes (e.g., "16GB RAM", "8GB DDR4")
  if (/\d+\s*gb\s*(ram|memory|ddr)/.test(value) && !specs.memory) {
    specs.memory = fieldValue
  }

  // Handle processor speeds (e.g., "2.4GHz", "3.2 GHz")
  if (/\d+\.?\d*\s*(ghz|mhz)/.test(value) && !specs.processor) {
    specs.processor = fieldValue
  }

  // Handle battery capacity (e.g., "5000mAh", "50Wh")
  if (/\d+\s*(mah|wh|hours?)/.test(value) && !specs.battery) {
    specs.battery = fieldValue
  }
}

function extractPriceInfo(product: ExtractedProduct, fieldName: string, fieldValue: string) {
  if (PRICE_KEYWORDS.some((keyword) => fieldName.includes(keyword))) {
    // Try to extract numeric price
    const priceMatch = fieldValue.match(/[\d,]+\.?\d*/)
    if (priceMatch) {
      const price = Number.parseFloat(priceMatch[0].replace(/,/g, ""))
      if (!isNaN(price)) {
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

function cleanupProductData(product: ExtractedProduct) {
  // Remove empty specs
  Object.keys(product.specs).forEach((key) => {
    if (!product.specs[key] || product.specs[key]?.trim() === "") {
      delete product.specs[key]
    }
  })

  // Generate description from specs
  if (!product.description && Object.keys(product.specs).length > 0) {
    const specEntries = Object.entries(product.specs)
      .filter(([_, value]) => value && value.length < 100) // Avoid very long values
      .slice(0, 5) // Take top 5 specs
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
      description += titleParts.join(" ") + "\n"
    }

    // Only show the most important specifications (max 4-5)
    const keySpecs = getKeySpecifications(product.specs)

    if (keySpecs.length > 0) {
      description += "\nKey Features:\n"
      keySpecs.forEach(([key, value]) => {
        const shortValue = truncateValue(value, 50) // Limit value length
        description += `• ${getSpecDisplayName(key)}: ${shortValue}\n`
      })
    }

    // Add custom description if it's short and relevant
    if (
      product.description &&
      product.description.length < 200 &&
      !description.toLowerCase().includes(product.description.toLowerCase())
    ) {
      description += `\n${product.description}`
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

function getKeySpecifications(specs: TechSpecs): [string, string][] {
  // Priority order for most important specs
  const priorityOrder = ["display", "processor", "memory", "storage", "graphics", "battery", "operatingSystem"]

  const keySpecs: [string, string][] = []

  // Add priority specs first
  for (const specKey of priorityOrder) {
    if (specs[specKey] && keySpecs.length < 5) {
      keySpecs.push([specKey, specs[specKey]!])
    }
  }

  // If we still have room, add other important specs
  if (keySpecs.length < 5) {
    const remainingSpecs = Object.entries(specs)
      .filter(
        ([key, value]) => !priorityOrder.includes(key) && value && value.trim() && value.length < 80, // Avoid very long values
      )
      .slice(0, 5 - keySpecs.length)

    keySpecs.push(...remainingSpecs)
  }

  return keySpecs
}

function getSpecDisplayName(specKey: string): string {
  const displayNames: { [key: string]: string } = {
    display: "Display",
    processor: "Processor",
    memory: "RAM",
    storage: "Storage",
    graphics: "Graphics",
    operatingSystem: "OS",
    battery: "Battery",
    connectivity: "Connectivity",
    camera: "Camera",
    audio: "Audio",
    security: "Security",
    ports: "Ports",
    wireless: "Wireless",
    dimensions: "Size",
    weight: "Weight",
  }

  return displayNames[specKey] || capitalizeFirst(specKey.replace(/([A-Z])/g, " $1"))
}

function truncateValue(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value

  // Try to truncate at a word boundary
  const truncated = value.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + "..."
  }

  return truncated + "..."
}
