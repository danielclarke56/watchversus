import type { Watch } from './types'

export interface Badge {
  text: string
  icon: string
  color: 'gold' | 'blue' | 'green' | 'purple'
}

export function generateComparisonBadges(watch: Watch, otherWatch: Watch): Badge[] {
  const badges: Badge[] = []

  // "Best for diving" — water resistance ≥ 200m
  if (watch.water_resistance_m >= 200 && otherWatch.water_resistance_m < 200) {
    badges.push({
      text: 'Best for diving',
      icon: '🤿',
      color: 'blue',
    })
  }

  // "Best value" — significantly lower price
  const priceDiff = Math.abs(watch.price_new_usd.min - otherWatch.price_new_usd.min)
  const pricePct = priceDiff / Math.max(watch.price_new_usd.min, otherWatch.price_new_usd.min)
  if (pricePct > 0.3 && watch.price_new_usd.min < otherWatch.price_new_usd.min) {
    badges.push({
      text: 'Best value',
      icon: '💰',
      color: 'green',
    })
  }

  // "Better legibility" — larger case diameter
  if (watch.case_diameter_mm > otherWatch.case_diameter_mm && watch.case_diameter_mm - otherWatch.case_diameter_mm >= 2) {
    badges.push({
      text: 'Better legibility',
      icon: '👁️',
      color: 'purple',
    })
  }

  // "More accurate" — quartz vs mechanical
  if (watch.movement_type === 'quartz' && otherWatch.movement_type !== 'quartz') {
    badges.push({
      text: 'More accurate',
      icon: '⏱️',
      color: 'gold',
    })
  }

  // Limit to max 2 badges
  return badges.slice(0, 2)
}

export function getBadgeClasses(color: string): string {
  const map: { [key: string]: string } = {
    gold: 'bg-[#b8860b]/10 text-[#b8860b] border-[#b8860b]/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return map[color] || map.gold
}
