import watchesData from '@/data/watches.json'
import reviewsData from '@/data/reviews.json'
import type { Watch, Review, ReviewRatings } from './types'

export const watches: Watch[] = watchesData as Watch[]
export const seedReviews: Review[] = reviewsData as Review[]

export function getWatchBySlug(slug: string): Watch | undefined {
  return watches.find((w) => w.slug === slug)
}

export function getWatchById(id: string): Watch | undefined {
  return watches.find((w) => w.id === id)
}

export function getReviewsForWatch(watchId: string): Review[] {
  return seedReviews.filter((r) => r.watch_id === watchId)
}

export function getAllReviews(): Review[] {
  return [...seedReviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function calcAverageRatings(reviews: Review[]): ReviewRatings | null {
  if (reviews.length === 0) return null
  const keys: (keyof ReviewRatings)[] = [
    'value_for_money',
    'build_quality',
    'movement_reliability',
    'daily_wearability',
    'resale_strength',
  ]
  const totals = keys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as ReviewRatings)
  reviews.forEach((r) => {
    keys.forEach((k) => {
      totals[k] += r.ratings[k]
    })
  })
  return keys.reduce(
    (acc, k) => ({ ...acc, [k]: totals[k] / reviews.length }),
    {} as ReviewRatings
  )
}

export function calcOverallRating(ratings: ReviewRatings): number {
  const vals = Object.values(ratings)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function formatPrice(price: { min: number; max: number }): string {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (price.min === price.max) return fmt(price.min)
  return `${fmt(price.min)}–${fmt(price.max)}`
}

export const popularComparisons = [
  // Luxury Dive Watches
  { slug1: 'rolex-submariner-41', slug2: 'omega-seamaster-300m' },
  { slug1: 'rolex-submariner-41', slug2: 'tudor-black-bay-58' },
  { slug1: 'rolex-submariner-41', slug2: 'tudor-pelagos-39' },
  { slug1: 'rolex-submariner-41', slug2: 'breitling-superocean-42' },
  { slug1: 'rolex-submariner-41', slug2: 'seiko-prospex-spb143' },
  { slug1: 'omega-seamaster-300m', slug2: 'tudor-black-bay-58' },
  { slug1: 'omega-seamaster-300m', slug2: 'breitling-superocean-42' },
  { slug1: 'omega-seamaster-300m', slug2: 'tudor-pelagos-39' },
  { slug1: 'omega-seamaster-300m', slug2: 'panerai-luminor-44-pam01312' },
  { slug1: 'omega-seamaster-300m', slug2: 'tag-heuer-aquaracer-300' },
  { slug1: 'tudor-black-bay-58', slug2: 'seiko-prospex-spb143' },
  { slug1: 'tudor-black-bay-58', slug2: 'christopher-ward-c65-trident' },
  { slug1: 'tudor-pelagos-39', slug2: 'breitling-superocean-42' },
  { slug1: 'tudor-pelagos-39', slug2: 'longines-hydroconquest-41' },
  { slug1: 'breitling-superocean-42', slug2: 'panerai-luminor-44-pam01312' },
  { slug1: 'seiko-prospex-spb143', slug2: 'longines-hydroconquest-41' },
  { slug1: 'seiko-prospex-spb143', slug2: 'christopher-ward-c65-trident' },
  { slug1: 'baltic-aquascaphe', slug2: 'halios-seaforth' },
  { slug1: 'halios-tropik', slug2: 'christopher-ward-c65-trident' },

  // GMT & Travel Watches
  { slug1: 'rolex-gmt-master-ii-pepsi', slug2: 'tudor-black-bay-gmt' },
  { slug1: 'rolex-gmt-master-ii-pepsi', slug2: 'omega-seamaster-300m' },
  { slug1: 'tudor-black-bay-gmt', slug2: 'omega-seamaster-300m' },
  { slug1: 'rolex-gmt-master-ii-pepsi', slug2: 'breitling-navitimer-b01-42' },
  { slug1: 'tudor-black-bay-gmt', slug2: 'breitling-navitimer-b01-42' },
  { slug1: 'rolex-gmt-master-ii-pepsi', slug2: 'tag-heuer-carrera-42' },

  // Chronographs
  { slug1: 'omega-speedmaster-moonwatch', slug2: 'tag-heuer-carrera-42' },
  { slug1: 'omega-speedmaster-moonwatch', slug2: 'breitling-navitimer-b01-42' },
  { slug1: 'breitling-navitimer-b01-42', slug2: 'tag-heuer-carrera-42' },
  { slug1: 'omega-speedmaster-moonwatch', slug2: 'zenith-el-primero-38' },
  { slug1: 'breitling-navitimer-b01-42', slug2: 'zenith-el-primero-38' },
  { slug1: 'tag-heuer-carrera-42', slug2: 'iwc-pilot-chronograph-41' },

  // Dress Watches
  { slug1: 'cartier-santos', slug2: 'cartier-tank-must' },
  { slug1: 'rolex-datejust-36', slug2: 'cartier-ronde-solo' },
  { slug1: 'cartier-santos', slug2: 'nomos-tangente-38' },
  { slug1: 'cartier-santos', slug2: 'longines-master-collection-40' },
  { slug1: 'cartier-tank-must', slug2: 'nomos-tangente-38' },
  { slug1: 'nomos-tangente-38', slug2: 'longines-master-collection-40' },
  { slug1: 'patek-philippe-calatrava-5119', slug2: 'jaeger-lecoultre-master-ultra-thin' },
  { slug1: 'iwc-portugieser-40', slug2: 'longines-master-collection-40' },
  { slug1: 'iwc-portugieser-40', slug2: 'omega-aqua-terra-38' },
  { slug1: 'longines-master-collection-40', slug2: 'omega-aqua-terra-38' },
  { slug1: 'grand-seiko-sbga211-snowflake', slug2: 'omega-aqua-terra-38' },
  { slug1: 'grand-seiko-sbga211-snowflake', slug2: 'longines-master-collection-40' },
  { slug1: 'cartier-santos', slug2: 'iwc-pilot-mark-xviii' },
  { slug1: 'nomos-club-campus', slug2: 'hamilton-jazzmaster-40' },
  { slug1: 'nomos-club-campus', slug2: 'longines-master-collection-40' },
  { slug1: 'hamilton-jazzmaster-40', slug2: 'seiko-prospex-spb143' },

  // Field & Casual
  { slug1: 'hamilton-khaki-field-auto-38', slug2: 'nomos-club-campus' },
  { slug1: 'hamilton-khaki-field-auto-38', slug2: 'iwc-pilot-mark-xviii' },
  { slug1: 'iwc-pilot-mark-xviii', slug2: 'breitling-navitimer-b01-42' },
  { slug1: 'rolex-explorer-36', slug2: 'tudor-black-bay-58' },
  { slug1: 'rolex-explorer-36', slug2: 'hamilton-khaki-field-auto-38' },
  { slug1: 'rolex-explorer-36', slug2: 'seiko-prospex-spb143' },
  { slug1: 'rolex-explorer-36', slug2: 'nomos-club-campus' },
  { slug1: 'tissot-prx-40', slug2: 'hamilton-khaki-field-auto-38' },
  { slug1: 'tissot-prx-40', slug2: 'nomos-club-campus' },
  { slug1: 'tissot-prx-40', slug2: 'omega-constellation-39' },

  // Sports / Integrated Bracelet
  { slug1: 'rolex-submariner-date', slug2: 'ap-royal-oak-15500' },
  { slug1: 'ap-royal-oak-15500', slug2: 'patek-philippe-nautilus-5711' },
  { slug1: 'ap-royal-oak-15500', slug2: 'vacheron-constantin-overseas-4500v' },
  { slug1: 'patek-philippe-nautilus-5711', slug2: 'vacheron-constantin-overseas-4500v' },
  { slug1: 'ap-royal-oak-15500', slug2: 'rolex-day-date-40' },
  { slug1: 'patek-philippe-nautilus-5711', slug2: 'rolex-yacht-master-40' },

  // Rolex Across Categories
  { slug1: 'rolex-day-date-40', slug2: 'rolex-submariner-41' },
  { slug1: 'rolex-day-date-40', slug2: 'rolex-yacht-master-40' },
  { slug1: 'rolex-day-date-40', slug2: 'cartier-santos' },
  { slug1: 'rolex-yacht-master-40', slug2: 'tudor-pelagos-39' },
  { slug1: 'rolex-yacht-master-40', slug2: 'longines-hydroconquest-41' },
  { slug1: 'rolex-datejust-36', slug2: 'omega-aqua-terra-38' },
  { slug1: 'rolex-datejust-36', slug2: 'longines-master-collection-40' },
  { slug1: 'rolex-datejust-36', slug2: 'cartier-santos' },

  // Budget & Mid-Range
  { slug1: 'seiko-5-sports-srpe55', slug2: 'tissot-prx-40' },
  { slug1: 'seiko-5-sports-srpe55', slug2: 'longines-hydroconquest-41' },
  { slug1: 'seiko-5-sports-srpe55', slug2: 'hamilton-khaki-field-auto-38' },
  { slug1: 'swatch-sistem51', slug2: 'tissot-prx-40' },
  { slug1: 'swatch-sistem51', slug2: 'seiko-5-sports-srpe55' },
  { slug1: 'longines-hydroconquest-41', slug2: 'tissot-seastar-1000' },
  { slug1: 'longines-hydroconquest-41', slug2: 'christopher-ward-c65-trident' },
  { slug1: 'tissot-seastar-1000', slug2: 'seiko-prospex-spb143' },
  { slug1: 'tissot-prx-40', slug2: 'omega-constellation-39' },

  // Microbrands & Independents
  { slug1: 'baltic-aquascaphe', slug2: 'christopher-ward-c65-trident' },
  { slug1: 'halios-seaforth', slug2: 'christopher-ward-c65-trident' },
  { slug1: 'halios-tropik', slug2: 'baltic-aquascaphe' },
  { slug1: 'halios-seaforth', slug2: 'seiko-prospex-spb143' },
  { slug1: 'halios-tropik', slug2: 'longines-hydroconquest-41' },

  // Tag Heuer & Sports
  { slug1: 'tag-heuer-carrera-42', slug2: 'iwc-pilot-chronograph-41' },
  { slug1: 'tag-heuer-carrera-42', slug2: 'omega-speedmaster-moonwatch' },
  { slug1: 'tag-heuer-carrera-42', slug2: 'rolex-gmt-master-ii-pepsi' },

  // Omega Across Categories
  { slug1: 'omega-constellation-39', slug2: 'longines-master-collection-40' },
  { slug1: 'omega-constellation-39', slug2: 'cartier-santos' },
  { slug1: 'omega-aqua-terra-38', slug2: 'rolex-datejust-36' },
  { slug1: 'omega-aqua-terra-38', slug2: 'iwc-portugieser-40' },
  { slug1: 'omega-seamaster-300m', slug2: 'cartier-tank-must' },

  // Breitling Across Categories
  { slug1: 'breitling-superocean-42', slug2: 'breitling-navitimer-b01-42' },
  { slug1: 'breitling-superocean-42', slug2: 'rolex-submariner-41' },
  { slug1: 'breitling-superocean-42', slug2: 'tudor-pelagos-39' },

  // IWC Pairings
  { slug1: 'iwc-pilot-mark-xviii', slug2: 'breitling-navitimer-b01-42' },
  { slug1: 'iwc-portugieser-40', slug2: 'cartier-santos' },
  { slug1: 'iwc-pilot-chronograph-41', slug2: 'zenith-el-primero-38' },

  // Zenith
  { slug1: 'zenith-el-primero-38', slug2: 'omega-speedmaster-moonwatch' },
  { slug1: 'zenith-el-primero-38', slug2: 'breitling-navitimer-b01-42' },

  // Panerai
  { slug1: 'panerai-luminor-44-pam01312', slug2: 'rolex-submariner-41' },
  { slug1: 'panerai-luminor-44-pam01312', slug2: 'tudor-black-bay-58' },

  // Nomos Further Comparisons
  { slug1: 'nomos-tangente-38', slug2: 'cartier-tank-must' },
  { slug1: 'nomos-club-campus', slug2: 'tissot-prx-40' },
  { slug1: 'nomos-club-campus', slug2: 'seiko-5-sports-srpe55' },

  // Grand Seiko Pairings
  { slug1: 'grand-seiko-sbga211-snowflake', slug2: 'rolex-datejust-36' },
  { slug1: 'grand-seiko-sbga211-snowflake', slug2: 'cartier-santos' },
  { slug1: 'grand-seiko-sbga211-snowflake', slug2: 'nomos-tangente-38' },

  // Longines Further Pairings
  { slug1: 'longines-master-collection-40', slug2: 'iwc-pilot-mark-xviii' },
  { slug1: 'longines-master-collection-40', slug2: 'tudor-black-bay-58' },

  // Hamilton Additional
  { slug1: 'hamilton-jazzmaster-40', slug2: 'cartier-santos' },
  { slug1: 'hamilton-jazzmaster-40', slug2: 'nomos-tangente-38' },

  // Vacheron Constantin
  { slug1: 'vacheron-constantin-overseas-4500v', slug2: 'ap-royal-oak-15500' },
  { slug1: 'vacheron-constantin-overseas-4500v', slug2: 'patek-philippe-nautilus-5711' },
  { slug1: 'vacheron-constantin-overseas-4500v', slug2: 'rolex-day-date-40' },

  // Ultra-Luxury Comparisons
  { slug1: 'rolex-datejust-36', slug2: 'patek-philippe-nautilus-5711' },
  { slug1: 'rolex-day-date-40', slug2: 'patek-philippe-nautilus-5711' },

  // Additional Strategic Pairs
  { slug1: 'tudor-black-bay-gmt', slug2: 'rolex-gmt-master-ii-pepsi' },
  { slug1: 'tudor-pelagos-39', slug2: 'seiko-prospex-spb143' },
  { slug1: 'seiko-5-sports-srpe55', slug2: 'christopher-ward-c65-trident' },
  { slug1: 'omega-seamaster-300m', slug2: 'seiko-prospex-spb143' },
  { slug1: 'iwc-pilot-mark-xviii', slug2: 'cartier-santos' },
  { slug1: 'breitling-navitimer-b01-42', slug2: 'tag-heuer-carrera-42' },
]
