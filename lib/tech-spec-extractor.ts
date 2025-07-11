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
  confidence?: number
}

// Enhanced NLP-based specification patterns with context awareness
const ADVANCED_SPEC_PATTERNS = {
  display: {
    patterns: [
      // Screen size patterns with various formats
      /(?:display|screen|monitor|lcd|led|oled|panel).*?(\d+(?:\.\d+)?)\s*(?:inch|"|''|in)\b/i,
      /(\d+(?:\.\d+)?)\s*(?:inch|"|''|in).*?(?:display|screen|monitor)/i,
      // Resolution patterns
      /(?:resolution|res).*?(\d+\s*[x×]\s*\d+)(?:\s*(?:pixels?|px|p))?/i,
      /(\d+\s*[x×]\s*\d+).*?(?:resolution|pixels?|px)/i,
      // Display technology
      /(?:display|screen|panel).*?(ips|tn|va|oled|amoled|lcd|led|qled|micro\s*led)/i,
      /(ips|tn|va|oled|amoled|lcd|led|qled|micro\s*led).*?(?:display|screen|panel)/i,
      // Display quality descriptors
      /(fhd|uhd|4k|2k|1080p|720p|qhd|wqhd|retina|super\s*retina)/i,
      // Brightness and color
      /(\d+)\s*(?:nits?|cd\/m²)(?:\s*brightness)?/i,
      /(?:brightness|luminance).*?(\d+)\s*(?:nits?|cd\/m²)/i,
      // Touch capability
      /(touch\s*screen|touchscreen|multi[- ]?touch|capacitive\s*touch)/i,
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
      "ips",
      "tn",
      "va",
      "amoled",
      "retina",
      "fhd",
      "uhd",
      "4k",
    ],
    synonyms: {
      display: ["screen", "monitor", "panel", "lcd", "led"],
      touchscreen: ["touch screen", "multi-touch", "capacitive touch"],
      resolution: ["res", "pixel density", "screen resolution"],
      brightness: ["luminance", "nits", "cd/m²"],
    },
  },
  processor: {
    patterns: [
      // Intel processors with generations and models
      /(intel)\s+(?:core\s+)?(i[3579]|celeron|pentium|xeon|atom)\s*[-\s]*(\d+[a-z]*(?:\s*[a-z]+)?)/i,
      // AMD processors
      /(amd)\s+(?:ryzen\s*)?([3579]|threadripper|athlon|fx)\s*[-\s]*(\d+[a-z]*)/i,
      // Mobile processors
      /(snapdragon|exynos|apple\s*[am]\d+|mediatek|kirin|dimensity)\s*(\d+[a-z]*)?/i,
      // Processor speed
      /(?:processor|cpu).*?(\d+(?:\.\d+)?)\s*(ghz|mhz)/i,
      /(\d+(?:\.\d+)?)\s*(ghz|mhz).*?(?:processor|cpu|clock|speed)/i,
      // Core count
      /(\d+)[-\s]*(?:core|thread)(?:\s*processor|\s*cpu)?/i,
      /(quad|dual|octa|hexa|single)[-\s]*core/i,
      // Architecture
      /(x86|x64|arm|armv[78]|64[-\s]*bit|32[-\s]*bit)/i,
    ],
    keywords: [
      "processor",
      "cpu",
      "intel",
      "amd",
      "core",
      "ghz",
      "snapdragon",
      "chipset",
      "ryzen",
      "celeron",
      "pentium",
      "thread",
      "clock",
      "speed",
    ],
    synonyms: {
      processor: ["cpu", "chipset", "soc", "system on chip"],
      core: ["thread", "processing unit"],
      speed: ["clock", "frequency", "ghz", "mhz"],
    },
  },
  storage: {
    patterns: [
      // Storage capacity with type
      /(?:storage|disk|drive|ssd|hdd).*?(\d+)\s*(gb|tb|mb)/i,
      /(\d+)\s*(gb|tb|mb)\s*(?:storage|disk|drive|ssd|hdd|nvme|emmc|ufs)/i,
      // Storage type specifications
      /(ssd|hdd|solid\s*state|hard\s*drive|nvme|emmc|ufs|sata|pcie)\s*(?:drive|storage)?/i,
      // Multiple storage configurations
      /(\d+\s*gb|tb)\s*(ssd|hdd).*?(?:\+|and|plus).*?(\d+\s*gb|tb)\s*(ssd|hdd)/i,
      // Storage interface
      /(nvme|sata|pcie|m\.2|msata)\s*(?:ssd|interface|slot)?/i,
    ],
    keywords: [
      "storage",
      "ssd",
      "hdd",
      "disk",
      "drive",
      "nvme",
      "emmc",
      "gb",
      "tb",
      "solid state",
      "hard drive",
      "pcie",
      "sata",
      "m.2",
    ],
    synonyms: {
      storage: ["disk", "drive", "memory", "capacity"],
      ssd: ["solid state drive", "solid state", "nvme", "m.2"],
      hdd: ["hard drive", "hard disk", "mechanical drive"],
    },
  },
  memory: {
    patterns: [
      // RAM capacity and type
      /(?:ram|memory).*?(\d+)\s*(gb|mb)/i,
      /(\d+)\s*(gb|mb)\s*(?:ram|memory|ddr[345]?|lpddr[345]?)/i,
      // Memory type specifications
      /(ddr[345]|lpddr[345])\s*[-\s]*(\d+)?\s*(?:gb|mb)?/i,
      // Memory speed
      /(?:ram|memory).*?(\d+)\s*mhz/i,
      /(\d+)\s*mhz.*?(?:ram|memory|ddr)/i,
      // Memory configuration
      /(\d+)\s*x\s*(\d+)\s*(?:gb|mb)\s*(?:ram|memory)/i,
    ],
    keywords: ["ram", "memory", "ddr", "lpddr", "gb", "mb", "dimm", "sodimm", "dual channel", "memory speed", "mhz"],
    synonyms: {
      memory: ["ram", "system memory", "main memory"],
      ddr: ["ddr3", "ddr4", "ddr5", "lpddr", "lpddr4", "lpddr5"],
    },
  },
  graphics: {
    patterns: [
      // GPU brands and models
      /(nvidia|amd|intel)\s+(?:geforce\s+)?(gtx|rtx|radeon|iris|uhd|arc)\s*(\w+)?/i,
      // Integrated vs dedicated
      /(integrated|dedicated|discrete)\s*(?:graphics|gpu|video)/i,
      // VRAM specifications
      /(?:graphics|gpu|vram).*?(\d+)\s*(gb|mb)\s*(?:vram|memory|gddr)/i,
      /(\d+)\s*(gb|mb)\s*(?:vram|graphics\s*memory|gddr)/i,
      // Graphics technology
      /(ray\s*tracing|dlss|fsr|directx|opengl|vulkan|cuda)/i,
    ],
    keywords: [
      "graphics",
      "gpu",
      "nvidia",
      "amd",
      "geforce",
      "radeon",
      "integrated",
      "dedicated",
      "vram",
      "directx",
      "opengl",
      "cuda",
      "ray tracing",
    ],
    synonyms: {
      graphics: ["gpu", "video card", "graphics card", "video"],
      integrated: ["onboard", "built-in", "shared"],
      dedicated: ["discrete", "separate"],
    },
  },
  battery: {
    patterns: [
      // Battery capacity
      /(?:battery|power).*?(\d+)\s*(mah|wh|whr)/i,
      /(\d+)\s*(mah|wh|whr)\s*(?:battery|power|capacity)?/i,
      // Battery life
      /(?:battery\s*life|usage\s*time).*?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i,
      /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h).*?(?:battery|usage|life)/i,
      // Charging specifications
      /(fast\s*charg|quick\s*charg|wireless\s*charg|usb[-\s]*c\s*charg)/i,
      /(?:charg|adapter).*?(\d+)\s*w(?:att)?/i,
      /(\d+)\s*w(?:att)?\s*(?:charg|adapter|power)/i,
    ],
    keywords: [
      "battery",
      "mah",
      "wh",
      "hours",
      "charging",
      "power",
      "adapter",
      "fast charge",
      "wireless charging",
      "battery life",
      "watt",
    ],
    synonyms: {
      battery: ["power", "battery life", "battery capacity"],
      charging: ["charge", "charger", "adapter", "power supply"],
      "fast charging": ["quick charge", "rapid charge", "turbo charge"],
    },
  },
  connectivity: {
    patterns: [
      // WiFi standards
      /(wifi|wi[-\s]*fi)\s*([6e]?|802\.11\s*[abgnacax]+)/i,
      // Bluetooth versions
      /(bluetooth|bt)\s*([\d.]+)?/i,
      // Cellular connectivity
      /(5g|4g|lte|3g|gsm|cdma)\s*(?:connectivity|network|cellular)?/i,
      // Wired connectivity
      /(ethernet|lan|rj45|gigabit)/i,
      // Near field communication
      /(nfc|near\s*field\s*communication)/i,
    ],
    keywords: [
      "wifi",
      "bluetooth",
      "5g",
      "4g",
      "lte",
      "ethernet",
      "nfc",
      "connectivity",
      "wireless",
      "802.11",
      "bt",
      "lan",
      "network",
    ],
    synonyms: {
      wifi: ["wi-fi", "wireless", "802.11", "wlan"],
      bluetooth: ["bt", "wireless"],
      ethernet: ["lan", "wired", "rj45", "gigabit"],
    },
  },
  ports: {
    patterns: [
      // USB ports with versions
      /(usb)\s*([abc]?[\d.]*|[-\s]*c|[-\s]*a)/i,
      // Display ports
      /(hdmi\s*[\d.]*|displayport|dp|vga|dvi|thunderbolt\s*[\d]*)/i,
      // Audio ports
      /(audio\s*jack|headphone\s*jack|3\.5mm|mic\s*jack)/i,
      // Memory card slots
      /(sd\s*card|micro\s*sd|tf\s*card|memory\s*card)\s*(?:slot|reader)?/i,
      // Power ports
      /(dc\s*jack|power\s*jack|barrel\s*jack)/i,
    ],
    keywords: [
      "usb",
      "hdmi",
      "thunderbolt",
      "audio jack",
      "sd card",
      "ports",
      "displayport",
      "vga",
      "dvi",
      "headphone",
      "microphone",
    ],
    synonyms: {
      ports: ["connections", "connectors", "interfaces"],
      usb: ["universal serial bus"],
      "audio jack": ["headphone jack", "3.5mm", "aux"],
    },
  },
  operatingSystem: {
    patterns: [
      // Windows versions
      /(windows)\s*(\d+|xp|vista|7|8|10|11)?/i,
      // macOS versions
      /(macos|mac\s*os|os\s*x)\s*([\w\s]+)?/i,
      // Linux distributions
      /(linux|ubuntu|debian|fedora|centos|arch|mint)/i,
      // Mobile OS
      /(android|ios)\s*(\d+(?:\.\d+)?)?/i,
      // Chrome OS
      /(chrome\s*os|chromeos)/i,
    ],
    keywords: [
      "windows",
      "macos",
      "linux",
      "android",
      "ios",
      "chrome os",
      "operating system",
      "os",
      "ubuntu",
      "debian",
    ],
    synonyms: {
      "operating system": ["os", "system", "platform"],
      macos: ["mac os", "os x", "osx"],
      windows: ["win", "microsoft windows"],
    },
  },
  camera: {
    patterns: [
      // Camera resolution
      /(?:camera|cam).*?(\d+)\s*(mp|megapixel)/i,
      /(\d+)\s*(mp|megapixel)\s*(?:camera|cam|sensor)/i,
      // Camera position
      /(front|rear|back|selfie)\s*camera\s*(?:(\d+)\s*mp)?/i,
      // Camera features
      /(autofocus|optical\s*zoom|digital\s*zoom|image\s*stabilization|ois)/i,
      // Video recording
      /(4k|1080p|720p)\s*(?:video|recording)/i,
    ],
    keywords: [
      "camera",
      "mp",
      "megapixel",
      "autofocus",
      "zoom",
      "video",
      "front camera",
      "rear camera",
      "selfie",
      "4k",
      "1080p",
    ],
    synonyms: {
      camera: ["cam", "sensor", "lens"],
      megapixel: ["mp", "mega pixel"],
      "front camera": ["selfie camera", "front-facing"],
    },
  },
  dimensions: {
    patterns: [
      // Dimensions with units
      /(?:dimensions?|size).*?(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(mm|cm|inch)/i,
      /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(mm|cm|inch)/i,
      // Individual measurements
      /(?:length|width|height|depth|thickness).*?(\d+(?:\.\d+)?)\s*(mm|cm|inch)/i,
    ],
    keywords: ["dimensions", "size", "length", "width", "height", "mm", "cm", "thickness", "depth", "compact", "slim"],
    synonyms: {
      dimensions: ["size", "measurements"],
      thickness: ["depth", "thin", "slim"],
    },
  },
  weight: {
    patterns: [
      // Weight with units
      /(?:weight|weighs?).*?(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|pound|ounce|oz)/i,
      /(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|pound|ounce|oz)(?:\s*weight)?/i,
    ],
    keywords: ["weight", "kg", "gram", "pound", "lb", "oz", "light", "heavy", "weighs"],
    synonyms: {
      weight: ["mass", "weighs"],
      kg: ["kilogram", "kilo"],
      g: ["gram", "grams"],
      lb: ["pound", "pounds", "lbs"],
    },
  },
}

// Enhanced brand recognition with variations and common misspellings
const ENHANCED_BRAND_PATTERNS = [
  // Technology brands
  /\b(apple|samsung|google|huawei|xiaomi|oneplus|oppo|vivo|realme|nokia|motorola|lg)\b/i,
  // Computer brands
  /\b(dell|hp|hewlett[-\s]*packard|lenovo|asus|acer|msi|alienware|razer|surface|macbook|thinkpad)\b/i,
  // Processor brands
  /\b(intel|amd|nvidia|qualcomm|mediatek|broadcom|arm|apple\s*silicon)\b/i,
  // Common variations and misspellings
  /\b(hewlet[-\s]*packard|hewlett[-\s]*packard|hp\s*inc|dell\s*technologies)\b/i,
]

// Enhanced model recognition with context
const ENHANCED_MODEL_PATTERNS = [
  // Mobile devices
  /\b(iphone\s*\d+(?:\s*pro)?(?:\s*max)?|galaxy\s*[a-z]*\d+|pixel\s*\d+[a-z]*|mate\s*\d+)\b/i,
  // Laptops
  /\b(ideapad|thinkpad|pavilion|inspiron|vivobook|zenbook|macbook|surface\s*(?:pro|laptop|book))\s*[\w\d]*\b/i,
  // Graphics cards
  /\b(geforce\s*(?:gtx|rtx)\s*\d+|radeon\s*(?:rx|r[x\d]+)\s*\d+)\b/i,
  // Processors
  /\b(core\s*i[3579][-\s]*\d+[a-z]*|ryzen\s*[3579]\s*\d+[a-z]*)\b/i,
]

// Enhanced price extraction with multiple currencies and formats
const ENHANCED_PRICE_PATTERNS = [
  // Standard currency formats
  /(?:price|cost|amount|total|msrp|retail|selling|value)\s*:?\s*([€$£¥₹₽]?\s*[\d,]+\.?\d*)\s*([€$£¥₹₽]|usd|eur|gbp|jpy|inr|rub|dollars?|euros?|pounds?|yen|rupees?)?/i,
  // Currency symbols with amounts
  /([€$£¥₹₽])\s*([\d,]+\.?\d*)/i,
  // Amounts with currency words
  /([\d,]+\.?\d*)\s*(usd|eur|gbp|jpy|inr|rub|dollars?|euros?|pounds?|yen|rupees?)/i,
  // Price ranges
  /(?:price|cost).*?([\d,]+\.?\d*)\s*[-–—to]\s*([\d,]+\.?\d*)/i,
]

// Context-aware extraction confidence scoring
interface ExtractionResult {
  value: string
  confidence: number
  source: string
  context: string
}

function groupRecordsByProduct(records: any[]): any[][] {
  // Enhanced grouping with semantic similarity
  const groups: { [key: string]: any[] } = {}
  const semanticGroups: any[][] = []

  // First pass: group by sheet/node
  for (const record of records) {
    const groupKey = record.sheetOrNode || record.parentContext || "default"
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(record)
  }

  // Second pass: merge semantically similar groups
  const groupValues = Object.values(groups)
  for (const group of groupValues) {
    let merged = false

    // Try to merge with existing semantic groups
    for (const semanticGroup of semanticGroups) {
      if (areGroupsSemanticallyRelated(group, semanticGroup)) {
        semanticGroup.push(...group)
        merged = true
        break
      }
    }

    if (!merged) {
      semanticGroups.push([...group])
    }
  }

  return semanticGroups.length > 0 ? semanticGroups : groupValues
}

function areGroupsSemanticallyRelated(group1: any[], group2: any[]): boolean {
  // Check for common product indicators
  const getProductIndicators = (group: any[]) => {
    const indicators = new Set<string>()
    for (const record of group) {
      const text = `${record.fieldName || ""} ${record.fieldValue || ""}`.toLowerCase()

      // Extract potential product names, brands, models
      for (const pattern of ENHANCED_BRAND_PATTERNS) {
        const match = text.match(pattern)
        if (match) indicators.add(match[1].toLowerCase())
      }

      for (const pattern of ENHANCED_MODEL_PATTERNS) {
        const match = text.match(pattern)
        if (match) indicators.add(match[1].toLowerCase())
      }
    }
    return indicators
  }

  const indicators1 = getProductIndicators(group1)
  const indicators2 = getProductIndicators(group2)

  // Check for overlap
  for (const indicator of indicators1) {
    if (indicators2.has(indicator)) {
      return true
    }
  }

  return false
}

function analyzeProductGroupAdvanced(records: any[]): ExtractedProduct | null {
  const product: ExtractedProduct = {
    specs: {},
    confidence: 0,
  }

  // Collect all text for comprehensive analysis
  const allText = records.map((r) => `${r.fieldName || ""} ${r.fieldValue || ""}`).join(" ")
  const confidenceScores: number[] = []

  // Multi-pass extraction with different strategies

  // Pass 1: Extract basic product information
  const productInfoResult = extractProductInfoAdvanced(product, records, allText)
  confidenceScores.push(productInfoResult.confidence)

  // Pass 2: Extract technical specifications with NLP enhancement
  const specsResult = extractSpecificationsNLP(product.specs, records, allText)
  confidenceScores.push(specsResult.confidence)

  // Pass 3: Extract price with advanced patterns
  const priceResult = extractPriceInfoNLP(product, records, allText)
  confidenceScores.push(priceResult.confidence)

  // Pass 4: Post-process and validate
  const validationResult = validateAndCleanupProduct(product)
  confidenceScores.push(validationResult.confidence)

  // Calculate overall confidence
  product.confidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length

  return product
}

function extractProductInfoAdvanced(
  product: ExtractedProduct,
  records: any[],
  allText: string,
): { confidence: number } {
  let confidence = 0
  const maxConfidence = 100

  // Enhanced brand extraction with fuzzy matching
  for (const pattern of ENHANCED_BRAND_PATTERNS) {
    const matches = allText.match(new RegExp(pattern.source, "gi"))
    if (matches && !product.brand) {
      // Choose the most frequent brand mention
      const brandCounts = new Map<string, number>()
      matches.forEach((match) => {
        const brand = match.toLowerCase().trim()
        brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1)
      })

      const mostFrequentBrand = Array.from(brandCounts.entries()).sort((a, b) => b[1] - a[1])[0]

      if (mostFrequentBrand) {
        product.brand = capitalizeFirst(mostFrequentBrand[0])
        confidence += 30
      }
    }
  }

  // Enhanced model extraction with context
  for (const pattern of ENHANCED_MODEL_PATTERNS) {
    const match = allText.match(pattern)
    if (match && !product.model) {
      product.model = match[1].trim()
      confidence += 25
    }
  }

  // Extract name with better context awareness
  const nameExtractionResults = extractProductName(records, allText)
  if (nameExtractionResults.name) {
    product.name = nameExtractionResults.name
    confidence += nameExtractionResults.confidence
  }

  // Extract category with semantic analysis
  const categoryResult = extractProductCategory(records, allText)
  if (categoryResult.category) {
    product.category = categoryResult.category
    confidence += categoryResult.confidence
  }

  return { confidence: Math.min(confidence, maxConfidence) }
}

function extractProductName(records: any[], allText: string): { name: string | null; confidence: number } {
  const nameKeywords = ["name", "title", "product", "model", "item", "description"]
  let bestName = ""
  let bestConfidence = 0

  for (const record of records) {
    const fieldName = record.fieldName?.toLowerCase() || ""
    const fieldValue = record.fieldValue?.toString() || ""

    // Calculate relevance score for this field
    let relevanceScore = 0
    for (const keyword of nameKeywords) {
      if (fieldName.includes(keyword)) {
        relevanceScore += keyword === "name" ? 40 : keyword === "title" ? 35 : 20
      }
    }

    // Validate the field value as a potential product name
    if (fieldValue && fieldValue.length > 2 && fieldValue.length < 150) {
      // Bonus for containing brand or model information
      if (ENHANCED_BRAND_PATTERNS.some((pattern) => fieldValue.match(pattern))) {
        relevanceScore += 20
      }
      if (ENHANCED_MODEL_PATTERNS.some((pattern) => fieldValue.match(pattern))) {
        relevanceScore += 15
      }

      // Penalty for generic terms
      const genericTerms = ["product", "item", "specification", "details", "information"]
      if (genericTerms.some((term) => fieldValue.toLowerCase().includes(term))) {
        relevanceScore -= 10
      }

      if (relevanceScore > bestConfidence) {
        bestName = fieldValue.trim()
        bestConfidence = relevanceScore
      }
    }
  }

  return {
    name: bestName || null,
    confidence: Math.min(bestConfidence, 45),
  }
}

function extractProductCategory(records: any[], allText: string): { category: string | null; confidence: number } {
  const categoryKeywords = {
    laptop: ["laptop", "notebook", "ultrabook", "netbook", "portable computer"],
    desktop: ["desktop", "pc", "computer", "workstation", "tower"],
    tablet: ["tablet", "ipad", "surface", "slate"],
    smartphone: ["smartphone", "phone", "mobile", "cellular"],
    monitor: ["monitor", "display", "screen", "lcd", "led"],
    printer: ["printer", "inkjet", "laser", "multifunction"],
    router: ["router", "modem", "gateway", "access point"],
    camera: ["camera", "dslr", "mirrorless", "camcorder"],
    headphones: ["headphones", "earphones", "earbuds", "headset"],
    speaker: ["speaker", "soundbar", "bluetooth speaker"],
  }

  let bestCategory = ""
  let bestScore = 0

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0
    const lowerText = allText.toLowerCase()

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      const matches = lowerText.match(regex)
      if (matches) {
        score += matches.length * (keyword === category ? 10 : 5)
      }
    }

    if (score > bestScore) {
      bestCategory = category
      bestScore = score
    }
  }

  return {
    category: bestCategory || null,
    confidence: Math.min(bestScore * 2, 25),
  }
}

function extractSpecificationsNLP(specs: TechSpecs, records: any[], allText: string): { confidence: number } {
  let totalConfidence = 0
  let specCount = 0

  // Process each specification category with enhanced NLP
  for (const [specKey, specConfig] of Object.entries(ADVANCED_SPEC_PATTERNS)) {
    const extractionResults: ExtractionResult[] = []

    // Extract from individual records with context
    for (const record of records) {
      const fieldName = record.fieldName?.toLowerCase() || ""
      const fieldValue = record.fieldValue?.toString() || ""
      const combinedText = `${fieldName} ${fieldValue}`.toLowerCase()

      if (!fieldValue || fieldValue.length < 2) continue

      // Try pattern matching with confidence scoring
      for (const pattern of specConfig.patterns) {
        const match = combinedText.match(pattern)
        if (match) {
          const extractedValue = extractRelevantValueNLP(match, fieldValue, specKey)
          if (extractedValue) {
            const confidence = calculateExtractionConfidence(extractedValue, specKey, fieldName, fieldValue, match)

            extractionResults.push({
              value: extractedValue,
              confidence,
              source: "pattern",
              context: combinedText,
            })
          }
        }
      }

      // Try keyword matching with semantic analysis
      const keywordMatches = specConfig.keywords.filter((keyword) => combinedText.includes(keyword.toLowerCase()))

      if (keywordMatches.length > 0) {
        const semanticRelevance = calculateSemanticRelevance(fieldName, fieldValue, specKey, specConfig)
        if (semanticRelevance > 0.3) {
          const cleanedValue = cleanSpecValueNLP(fieldValue, specKey)
          if (cleanedValue && isGoodSpecValueNLP(cleanedValue, specKey)) {
            extractionResults.push({
              value: cleanedValue,
              confidence: semanticRelevance * 60,
              source: "keyword",
              context: combinedText,
            })
          }
        }
      }

      // Try synonym matching
      if (specConfig.synonyms) {
        for (const [mainTerm, synonyms] of Object.entries(specConfig.synonyms)) {
          for (const synonym of synonyms) {
            if (combinedText.includes(synonym.toLowerCase())) {
              const synonymConfidence = calculateSynonymConfidence(synonym, fieldValue, specKey)
              if (synonymConfidence > 0.2) {
                const cleanedValue = cleanSpecValueNLP(fieldValue, specKey)
                if (cleanedValue) {
                  extractionResults.push({
                    value: cleanedValue,
                    confidence: synonymConfidence * 50,
                    source: "synonym",
                    context: combinedText,
                  })
                }
              }
            }
          }
        }
      }
    }

    // Select the best extraction result for this specification
    if (extractionResults.length > 0) {
      const bestResult = extractionResults.reduce((best, current) =>
        current.confidence > best.confidence ? current : best,
      )

      if (bestResult.confidence > 30) {
        // Minimum confidence threshold
        specs[specKey] = bestResult.value
        totalConfidence += bestResult.confidence
        specCount++
      }
    }
  }

  return {
    confidence: specCount > 0 ? totalConfidence / specCount : 0,
  }
}

function extractRelevantValueNLP(match: RegExpMatchArray, originalText: string, specKey: string): string {
  if (!match) return ""

  // Enhanced extraction logic with context awareness
  const fullMatch = match[0]
  const groups = match.slice(1).filter((group) => group !== undefined)

  switch (specKey) {
    case "display":
      // Prioritize screen size, then resolution, then technology
      for (const group of groups) {
        if (group.match(/\d+\.?\d*\s*(?:inch|"|'')/i)) {
          return group + (group.includes("inch") ? "" : '"')
        }
      }
      for (const group of groups) {
        if (group.match(/\d+\s*[x×]\s*\d+/)) {
          return group + " resolution"
        }
      }
      return fullMatch

    case "processor":
      // Try to construct a complete processor name
      const processorParts = []
      for (const group of groups) {
        if (group && group.trim()) {
          processorParts.push(group.trim())
        }
      }
      return processorParts.length > 1 ? processorParts.join(" ") : fullMatch

    case "storage":
    case "memory":
      // Prioritize capacity with type
      for (const group of groups) {
        if (group.match(/\d+\s*(?:gb|tb|mb)/i)) {
          const typeMatch = originalText.match(/(ssd|hdd|ddr\d?|ram)/i)
          return group + (typeMatch ? ` ${typeMatch[1].toUpperCase()}` : "")
        }
      }
      return fullMatch

    case "battery":
      // Prioritize capacity, then life
      for (const group of groups) {
        if (group.match(/\d+\s*(?:mah|wh)/i)) {
          return group
        }
      }
      for (const group of groups) {
        if (group.match(/\d+(?:\.\d+)?\s*(?:hours?|hrs?)/i)) {
          return group + " battery life"
        }
      }
      return fullMatch

    default:
      return groups.length > 0 ? groups[0] : fullMatch
  }
}

function calculateExtractionConfidence(
  value: string,
  specKey: string,
  fieldName: string,
  fieldValue: string,
  match: RegExpMatchArray,
): number {
  let confidence = 50 // Base confidence for pattern match

  // Boost confidence based on field name relevance
  const relevantKeywords = ADVANCED_SPEC_PATTERNS[specKey]?.keywords || []
  for (const keyword of relevantKeywords) {
    if (fieldName.includes(keyword.toLowerCase())) {
      confidence += 15
      break
    }
  }

  // Boost confidence for complete matches
  if (match[0].length > value.length * 0.8) {
    confidence += 10
  }

  // Boost confidence for specific patterns
  switch (specKey) {
    case "display":
      if (value.match(/\d+\.?\d*\s*(?:inch|")/i)) confidence += 20
      if (value.match(/\d+\s*[x×]\s*\d+/)) confidence += 15
      break
    case "processor":
      if (value.match(/(intel|amd)/i)) confidence += 15
      if (value.match(/\d+\.?\d*\s*ghz/i)) confidence += 10
      break
    case "storage":
      if (value.match(/\d+\s*(?:gb|tb)\s*(?:ssd|hdd)/i)) confidence += 20
      break
    case "memory":
      if (value.match(/\d+\s*gb\s*(?:ddr|ram)/i)) confidence += 20
      break
  }

  // Penalize very short or very long values
  if (value.length < 3) confidence -= 20
  if (value.length > 100) confidence -= 10

  return Math.max(0, Math.min(100, confidence))
}

function calculateSemanticRelevance(fieldName: string, fieldValue: string, specKey: string, specConfig: any): number {
  let relevance = 0

  // Check field name relevance
  const keywords = specConfig.keywords || []
  for (const keyword of keywords) {
    if (fieldName.includes(keyword.toLowerCase())) {
      relevance += 0.3
    }
  }

  // Check value content relevance
  const lowerValue = fieldValue.toLowerCase()
  for (const keyword of keywords) {
    if (lowerValue.includes(keyword.toLowerCase())) {
      relevance += 0.2
    }
  }

  // Check synonym relevance
  if (specConfig.synonyms) {
    for (const synonymList of Object.values(specConfig.synonyms)) {
      for (const synonym of synonymList as string[]) {
        if (lowerValue.includes(synonym.toLowerCase()) || fieldName.includes(synonym.toLowerCase())) {
          relevance += 0.15
        }
      }
    }
  }

  return Math.min(1, relevance)
}

function calculateSynonymConfidence(synonym: string, fieldValue: string, specKey: string): number {
  let confidence = 0.3 // Base confidence for synonym match

  // Boost for exact matches
  if (fieldValue.toLowerCase().includes(synonym.toLowerCase())) {
    confidence += 0.2
  }

  // Boost for context-appropriate synonyms
  const contextBoosts = {
    display: ["screen", "monitor", "panel"],
    processor: ["cpu", "chipset"],
    storage: ["disk", "drive"],
    memory: ["ram"],
  }

  const boostSynonyms = contextBoosts[specKey as keyof typeof contextBoosts] || []
  if (boostSynonyms.includes(synonym.toLowerCase())) {
    confidence += 0.15
  }

  return confidence
}

function cleanSpecValueNLP(value: string, specKey: string): string {
  let cleaned = value.trim()

  // Remove common prefixes and suffixes
  cleaned = cleaned.replace(/^(specification|spec|feature|description):\s*/i, "")
  cleaned = cleaned.replace(/\s*(specification|spec|feature|description)$/i, "")

  // Spec-specific cleaning
  switch (specKey) {
    case "display":
      // Normalize display size format
      cleaned = cleaned.replace(/(\d+\.?\d*)\s*[""′]/g, '$1"')
      break
    case "processor":
      // Normalize processor names
      cleaned = cleaned.replace(/\s+/g, " ")
      break
    case "storage":
    case "memory":
      // Normalize capacity format
      cleaned = cleaned.replace(/(\d+)\s*(gb|tb|mb)/gi, "$1$2")
      break
  }

  // Limit length for readability
  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 117) + "..."
  }

  return cleaned
}

function isGoodSpecValueNLP(value: string, specKey: string): boolean {
  if (!value || value.length < 2 || value.length > 200) return false

  const lowerValue = value.toLowerCase()

  // Skip generic values
  const genericTerms = ["yes", "no", "true", "false", "n/a", "tbd", "unknown", "various"]
  if (genericTerms.some((term) => lowerValue === term)) return false

  // Skip if it's just a brand name without specs
  if (
    ENHANCED_BRAND_PATTERNS.some((pattern) => {
      const match = lowerValue.match(pattern)
      return match && match[0] === lowerValue
    })
  )
    return false

  // Spec-specific validation
  switch (specKey) {
    case "display":
      return (
        lowerValue.includes("inch") || lowerValue.includes("x") || lowerValue.match(/(fhd|uhd|4k|ips|oled)/i) !== null
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
      return (
        lowerValue.includes("gb") &&
        (lowerValue.includes("ram") || lowerValue.includes("ddr") || lowerValue.includes("memory"))
      )

    case "graphics":
      return (
        lowerValue.includes("nvidia") ||
        lowerValue.includes("amd") ||
        lowerValue.includes("intel") ||
        lowerValue.includes("integrated") ||
        lowerValue.includes("dedicated")
      )

    case "battery":
      return lowerValue.includes("mah") || lowerValue.includes("wh") || lowerValue.includes("hours")

    default:
      return true
  }
}

function extractPriceInfoNLP(product: ExtractedProduct, records: any[], allText: string): { confidence: number } {
  let confidence = 0

  // Enhanced price extraction with context analysis
  const priceExtractionResults: ExtractionResult[] = []

  // Extract from individual records with field name context
  for (const record of records) {
    const fieldName = record.fieldName?.toLowerCase() || ""
    const fieldValue = record.fieldValue?.toString() || ""
    const combinedText = `${fieldName} ${fieldValue}`

    // Check if this field is likely to contain price information
    const priceKeywords = ["price", "cost", "amount", "total", "msrp", "retail", "selling", "value", "fee"]
    const isPriceField = priceKeywords.some((keyword) => fieldName.includes(keyword))

    if (isPriceField || fieldValue.match(/[€$£¥₹₽]/)) {
      for (const pattern of ENHANCED_PRICE_PATTERNS) {
        const match = combinedText.match(pattern)
        if (match) {
          const priceResult = parsePriceMatch(match, fieldName, fieldValue)
          if (priceResult.price > 0) {
            const extractionConfidence = calculatePriceConfidence(
              priceResult.price,
              priceResult.currency,
              fieldName,
              isPriceField,
            )

            priceExtractionResults.push({
              value: priceResult.price.toString(),
              confidence: extractionConfidence,
              source: isPriceField ? "field_name" : "pattern",
              context: combinedText,
            })

            // Store currency if found
            if (priceResult.currency && !product.currency) {
              product.currency = priceResult.currency
            }
          }
        }
      }
    }
  }

  // If no price found in individual records, try the combined text
  if (priceExtractionResults.length === 0) {
    for (const pattern of ENHANCED_PRICE_PATTERNS) {
      const match = allText.match(pattern)
      if (match) {
        const priceResult = parsePriceMatch(match, "", allText)
        if (priceResult.price > 0) {
          priceExtractionResults.push({
            value: priceResult.price.toString(),
            confidence: 40, // Lower confidence for combined text extraction
            source: "combined_text",
            context: allText.substring(Math.max(0, (match.index || 0) - 50), (match.index || 0) + 100),
          })

          if (priceResult.currency && !product.currency) {
            product.currency = priceResult.currency
          }
        }
      }
    }
  }

  // Select the best price extraction result
  if (priceExtractionResults.length > 0) {
    const bestResult = priceExtractionResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best,
    )

    if (bestResult.confidence > 30) {
      product.price = Number.parseFloat(bestResult.value)
      confidence = bestResult.confidence
    }
  }

  // Set default currency if price exists but no currency found
  if (product.price && !product.currency) {
    product.currency = "USD"
    confidence = Math.max(confidence - 10, 0) // Slight penalty for assumed currency
  }

  return { confidence }
}

function parsePriceMatch(
  match: RegExpMatchArray,
  fieldName: string,
  fieldValue: string,
): { price: number; currency: string } {
  let priceValue = ""
  let currencyValue = ""

  // Extract price and currency from match groups
  if (match[1] && match[2]) {
    if (match[1].match(/[€$£¥₹₽]/)) {
      currencyValue = match[1]
      priceValue = match[2]
    } else {
      priceValue = match[1]
      currencyValue = match[2]
    }
  } else if (match[1]) {
    priceValue = match[1].replace(/[€$£¥₹₽]/g, "")
    const currencyMatch = match[0].match(/[€$£¥₹₽]|usd|eur|gbp|jpy|inr|rub/i)
    if (currencyMatch) {
      currencyValue = currencyMatch[0]
    }
  }

  // Clean and parse the price
  const cleanPrice = priceValue.replace(/[,\s]/g, "")
  const price = Number.parseFloat(cleanPrice)

  // Normalize currency
  const currency = normalizeCurrencyNLP(currencyValue)

  return {
    price: isNaN(price) ? 0 : price,
    currency,
  }
}

function calculatePriceConfidence(price: number, currency: string, fieldName: string, isPriceField: boolean): number {
  let confidence = 40 // Base confidence

  // Boost for price field names
  if (isPriceField) {
    confidence += 30
  }

  // Boost for reasonable price ranges (assuming most products are between $1 and $100,000)
  if (price >= 1 && price <= 100000) {
    confidence += 20
  } else if (price > 100000) {
    confidence -= 20 // Penalty for very high prices
  }

  // Boost for recognized currencies
  if (currency && currency.match(/^(USD|EUR|GBP|JPY|INR|RUB)$/)) {
    confidence += 10
  }

  return Math.max(0, Math.min(100, confidence))
}

function normalizeCurrencyNLP(currency: string): string {
  const currencyMap: { [key: string]: string } = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    "₽": "RUB",
    usd: "USD",
    eur: "EUR",
    gbp: "GBP",
    jpy: "JPY",
    inr: "INR",
    rub: "RUB",
    dollar: "USD",
    dollars: "USD",
    euro: "EUR",
    euros: "EUR",
    pound: "GBP",
    pounds: "GBP",
    yen: "JPY",
    rupee: "INR",
    rupees: "INR",
    ruble: "RUB",
    rubles: "RUB",
  }

  const normalized = currencyMap[currency.toLowerCase()]
  return normalized || currency.toUpperCase()
}

function validateAndCleanupProduct(product: ExtractedProduct): { confidence: number } {
  let confidence = 70 // Base confidence for validation

  // Remove empty specs
  Object.keys(product.specs).forEach((key) => {
    if (!product.specs[key] || product.specs[key]?.trim() === "") {
      delete product.specs[key]
    }
  })

  // Validate product completeness
  const hasName = !!(product.name || product.brand || product.model)
  const hasSpecs = Object.keys(product.specs).length > 0
  const hasPrice = !!product.price

  if (hasName) confidence += 10
  if (hasSpecs) confidence += 15
  if (hasPrice) confidence += 5

  // Penalize if product seems incomplete
  if (!hasName && !hasSpecs && !hasPrice) {
    confidence -= 50
  }

  // Validate spec quality
  let validSpecCount = 0
  for (const [key, value] of Object.entries(product.specs)) {
    if (value && isGoodSpecValueNLP(value, key)) {
      validSpecCount++
    }
  }

  if (validSpecCount > 3) confidence += 10
  else if (validSpecCount < 2) confidence -= 10

  return { confidence: Math.max(0, Math.min(100, confidence)) }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Specification display names for better formatting
const SPEC_DISPLAY_NAMES: { [key: string]: string } = {
  display: "Display",
  processor: "Processor",
  storage: "Storage",
  graphics: "Graphics",
  connectivity: "Connectivity",
  security: "Security",
  battery: "Battery",
  memory: "Memory",
  camera: "Camera",
  audio: "Audio",
  dimensions: "Dimensions",
  weight: "Weight",
  operatingSystem: "Operating System",
  ports: "Ports",
  wireless: "Wireless",
}

// Enhanced function to create structured line items from extracted products
export function createStructuredLineItems(products: ExtractedProduct[]): any[] {
  return products.map((product, index) => {
    // Create a clean, readable description
    let description = ""

    // Product title (brand + name/model)
    const titleParts = []
    if (product.brand) titleParts.push(product.brand)
    if (product.name) titleParts.push(product.name)
    else if (product.model) titleParts.push(product.model)

    if (titleParts.length > 0) {
      description += `${titleParts.join(" ")}`
    } else {
      // Fallback title
      description += product.category || "Product"
    }

    // Add category if available and not already in title
    if (product.category && !description.toLowerCase().includes(product.category.toLowerCase())) {
      description += ` - ${product.category}`
    }

    // Add all technical specifications in a clean, readable format
    const specs = Object.entries(product.specs).filter(([_, value]) => value && value.trim())

    if (specs.length > 0) {
      description += "\n\n━━━ TECHNICAL SPECIFICATIONS ━━━"

      // Group specifications by priority for better organization
      const priorityOrder = [
        "display",
        "processor",
        "memory",
        "storage",
        "graphics",
        "operatingSystem",
        "battery",
        "connectivity",
        "wireless",
        "ports",
        "camera",
        "audio",
        "security",
        "dimensions",
        "weight",
      ]

      // Add priority specs first
      const addedSpecs = new Set<string>()
      for (const specKey of priorityOrder) {
        if (product.specs[specKey] && !addedSpecs.has(specKey)) {
          const displayName = SPEC_DISPLAY_NAMES[specKey] || capitalizeFirst(specKey)
          const value = product.specs[specKey]!.trim()
          description += `\n▸ ${displayName}: ${value}`
          addedSpecs.add(specKey)
        }
      }

      // Add any remaining specs that weren't in the priority list
      for (const [specKey, value] of specs) {
        if (!addedSpecs.has(specKey) && value) {
          const displayName = SPEC_DISPLAY_NAMES[specKey] || capitalizeFirst(specKey.replace(/([A-Z])/g, " $1"))
          description += `\n▸ ${displayName}: ${value.trim()}`
        }
      }
    }

    // Add custom description if it exists and adds value
    if (
      product.description &&
      product.description.length > 10 &&
      !description.toLowerCase().includes(product.description.toLowerCase().substring(0, 50))
    ) {
      description += `\n\n━━━ ADDITIONAL INFORMATION ━━━\n${product.description}`
    }

    // Add confidence score for debugging (can be removed in production)
    if (product.confidence && product.confidence < 70) {
      description += `\n\n⚠️ Extraction confidence: ${Math.round(product.confidence)}%`
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
      confidence: product.confidence,
    }
  })
}
