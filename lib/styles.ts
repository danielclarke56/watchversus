// Site-wide design tokens for Watchems.
// Use these instead of writing Tailwind classes inline.
// Add new tokens here — never reach for an arbitrary value first.
//
// Rule: if you've written the same class string twice, it belongs here.
// Colors map to tailwind.config.ts semantic tokens (accent, textPrimary, surface, border, etc.)

// ─── Typography ───────────────────────────────────────────────────────────────

export const t = {
  h1:      'font-heading text-4xl sm:text-5xl font-semibold text-textPrimary tracking-tight leading-[1.1]',
  h2:      'font-heading text-2xl sm:text-3xl font-semibold text-textPrimary tracking-tight leading-snug',
  h3:      'font-heading text-lg font-semibold text-textPrimary leading-snug',
  h4:      'text-sm font-semibold text-textSecond uppercase tracking-wide',
  body:    'text-base text-textSecond leading-relaxed',
  strong:  'text-base font-semibold text-textPrimary',
  intro:   'text-lg text-textPrimary leading-relaxed font-normal',
  small:   'text-sm text-textSecond',
  meta:    'text-xs text-textMuted',
  eyebrow: 'text-xs font-semibold text-textMuted uppercase tracking-widest',
  link:    'text-accent hover:underline underline-offset-2 transition-colors',
} as const

// ─── Layout ───────────────────────────────────────────────────────────────────

export const l = {
  page:          'max-w-3xl mx-auto px-4 sm:px-6',
  pageWide:      'max-w-5xl mx-auto px-4 sm:px-6',
  pageFull:      'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section:       'pt-10 mb-14',
  sectionSm:     'pt-8 mb-10',
  sectionHeader: 'mb-5',
  rule:          'flex-1 h-px bg-border',
  prose:         'max-w-2xl',
} as const

// ─── Surfaces & Cards ─────────────────────────────────────────────────────────

export const c = {
  card:       'border border-border rounded-xl',
  cardHover:  'border border-border hover:border-borderStrong rounded-xl transition-colors',
  cardPadded: 'border border-border rounded-xl p-5',
  callout:    'rounded-xl border border-borderStrong bg-surfaceAlt p-7',
  divider:    'border-t border-border',
} as const

// ─── Interactive elements ─────────────────────────────────────────────────────

export const i = {
  pill:    'text-xs font-medium text-textSecond bg-surface hover:bg-surfaceAlt border border-border hover:border-borderStrong rounded-full px-3.5 py-1.5 transition-colors',
  navPill: 'text-xs font-medium text-textSecond hover:text-textPrimary bg-surface hover:bg-surfaceAlt border border-border hover:border-borderStrong rounded-full px-3 py-1 transition-colors whitespace-nowrap',
  badge:   'inline-flex items-center text-xs font-medium text-textSecond bg-surfaceAlt border border-border rounded-full px-2.5 py-1 leading-none',
} as const

// ─── Table ────────────────────────────────────────────────────────────────────

export const tb = {
  header:      'text-xs font-semibold text-textMuted uppercase tracking-widest',
  cell:        'text-base text-textSecond',
  cellStrong:  'text-base font-semibold text-textPrimary',
  row:         'bg-surface hover:bg-surfaceAlt transition-colors',
} as const

// ─── Buying guide alias — keeps imports clean in guide pages ──────────────────

export const gs = {
  eyebrow:         t.eyebrow,
  body:            t.body,
  bodyStrong:      t.strong,
  intro:           t.intro,
  meta:            t.meta,
  section:         l.section,
  sectionHeader:   l.sectionHeader,
  rule:            l.rule,
  card:            c.card,
  cardHover:       c.cardHover,
  badge:           i.badge,
  tableHeader:     tb.header,
  tableCell:       tb.cell,
  tableCellStrong: tb.cellStrong,
  tableRow:        tb.row,
  pill:            i.pill,
  navPill:         i.navPill,
} as const
