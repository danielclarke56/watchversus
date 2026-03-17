import { Watch } from './types'

export function byScore(a: Watch, b: Watch) {
  return (b.score ?? 0) - (a.score ?? 0)
}

export function inPriceBucket(min: number, max: number) {
  return (w: Watch) => w.price_new_usd.min >= min && w.price_new_usd.min < max
}

export function inSizeBucket(minMm: number, maxMm: number) {
  return (w: Watch) => w.case_diameter_mm >= minMm && w.case_diameter_mm <= maxMm
}

export function topN(watches: Watch[], n: number) {
  return [...watches].sort(byScore).slice(0, n)
}
