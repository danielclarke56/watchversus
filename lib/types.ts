export interface Watch {
  id: string
  slug: string
  name: string
  brand: string
  reference: string
  year_introduced: number
  case_diameter_mm: number
  case_thickness_mm: number
  lug_width_mm: number
  lug_to_lug_mm: number
  movement_type: 'automatic' | 'manual' | 'quartz'
  movement_caliber: string
  power_reserve_hours: number
  water_resistance_m: number
  crystal: 'sapphire' | 'mineral' | 'acrylic' | 'hardlex'
  case_material: string
  bracelet_material: string
  price_new_usd: { min: number; max: number }
  price_preowned_usd: { min: number; max: number }
  style: string[]
  description: string
  image?: string
  imageAlt?: string

  // MVP page fields — required
  primary_category: string // e.g. "dive", "dress", "sport", "gmt", "chronograph", "field"
  tagline: string // one-line sell: "The quintessential dive watch"
  score: number // e.g. 8.7 — out of 10
  buy_again_pct: number // e.g. 82 — integer 0–100
  pros: string[] // 3–5 bullet points
  cons: string[] // 3–5 bullet points
  verdict: {
    who_its_for: string // 1–2 sentence description
    who_should_skip: string // 1–2 sentence description
    final_take: string // short paragraph (3–4 sentences)
  }
  alternatives: string[] // array of watch slugs

  // Optional — populated over time
  rating_count?: number // total thumbs up/down votes received
  buy_again_count?: number // total yes/no votes received
  comparison_slugs?: string[] // slugs of compare pages that feature this watch
  official_images?: string[] // additional product image URLs
  owner_photo_count?: number // number of approved owner photos
}

export interface ReviewRatings {
  value_for_money: number
  build_quality: number
  movement_reliability: number
  daily_wearability: number
  resale_strength: number
}

export interface Review {
  id: string
  watch_id: string
  reviewer_name: string
  date: string
  ratings: ReviewRatings
  title: string
  body: string
  helpful_count: number
}

export interface ComparisonTierEntry {
  slug1: string
  slug2: string
  tier: 1 | 2 | 3
  priority: number
  tags: string[]
  reason: string
}

export interface ComparisonTiersData {
  comparisons: ComparisonTierEntry[]
}

export interface QuizAnswers {
  budget?: string
  style?: string
  movement?: string
  usecase?: string
  prestige?: string
}
