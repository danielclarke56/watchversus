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
  chrono24_url: string
  watchbox_url: string
  jomashop_url: string
  image_placeholder: boolean
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

export interface QuizAnswers {
  budget?: string
  style?: string
  movement?: string
  usecase?: string
  prestige?: string
}
