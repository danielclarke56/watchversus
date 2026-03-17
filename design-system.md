# WatchVsWatch Design System

> Implementation-ready reference. Keep in sync with `globals.css` and `tailwind.config.ts`.

---

## 1. Color System

### Base Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--bg-base` | `#F8FAFC` | Page canvas |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-subtle` | `#F1F5F9` | Input fills, hover states, alt rows |
| `--border` | `#E2E8F0` | Card edges, dividers |
| `--border-strong` | `#CBD5E1` | Inputs, prominent dividers |
| `--text-primary` | `#0F172A` | Headings, body |
| `--text-secondary` | `#475569` | Subtext, labels |
| `--text-muted` | `#94A3B8` | Meta, timestamps, placeholders |
| `--accent` | `#B8860B` | CTA buttons, links, highlights |
| `--accent-hover` | `#9A700A` | Hover darken |
| `--accent-light` | `#FEF3C7` | Tinted badge backgrounds |

### Outcome Colors

| Token | Hex | Use |
|-------|-----|-----|
| `--winner` | `#16A34A` | Victory badge, score bar fill, "Better" label |
| `--winner-bg` | `#F0FDF4` | Green tint background on winner card |
| `--loser` | `#94A3B8` | Non-winner result — neutral, not negative |
| `--loser-bg` | `#F8FAFC` | Same as page bg — no special treatment |

### Usage Rules
- Accent only on interactive elements and verdict callouts — never decorative
- Never use accent on body text or static icons
- Winner/Loser tokens apply to comparison outcomes only — never navigation or UI chrome
- Surface stack: `bg-base` → `bg-surface` → `bg-subtle` (never invert)
- Do not use red for comparison losers — this is a ranking tool, not a failure state

---

## 2. Typography

**Font:** `Inter` — fallback `system-ui, sans-serif`

| Role | Size | Weight | Tracking | Line Height | Use |
|------|------|--------|----------|-------------|-----|
| H1 | 32px / 2rem | 700 | -0.03em | 1.15 | Page titles (one per page) |
| H2 | 24px / 1.5rem | 600 | -0.02em | 1.2 | Section headers |
| H3 | 18px / 1.125rem | 600 | -0.01em | 1.3 | Card titles |
| H4 | 15px / 0.9375rem | 600 | -0.01em | 1.4 | Labels, sidebar heads |
| Body | 15px / 0.9375rem | 400 | 0 | 1.6 | Prose |
| Small | 13px / 0.8125rem | 400 | 0 | 1.5 | Secondary content |
| Meta | 12px / 0.75rem | 500 | 0.04em | 1.4 | Tags, badges, timestamps (ALL CAPS) |

### Rules
- H1 appears once per page — never in cards or components
- Meta/badge text: ALL CAPS + letter-spacing; never sentence case
- Comparison numbers: `font-weight: 700`, `font-variant-numeric: tabular-nums`
- Prose max-width: `65ch`

---

## 3. Spacing System

**Base unit: 4px**

| Step | px | Tailwind | Use |
|------|----|----------|-----|
| 1 | 4px | `space-1` | Icon internal gap |
| 2 | 8px | `space-2` | Badge padding, icon+label gap |
| 3 | 12px | `space-3` | Compact padding |
| 4 | 16px | `space-4` | Default card padding, small gaps |
| 5 | 20px | `space-5` | Card internal padding |
| 6 | 24px | `space-6` | Between card sections |
| 8 | 32px | `space-8` | Card-to-card gap |
| 12 | 48px | `space-12` | Section top padding (mobile) |
| 16 | 64px | `space-16` | Section spacing (desktop) |
| 24 | 96px | `space-24` | Major page section breaks |

### Section Spacing Rules
- Between page sections: `py-12` mobile → `py-16` desktop (minimum `py-10`)
- Card internal padding: `p-4` mobile → `p-5` desktop
- Inline gaps (icon + text): `gap-2`
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## 4. UI Foundations

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 4px | Tags, badges, pills |
| `rounded-md` | 8px | Buttons, small cards |
| `rounded-lg` | 12px | Cards (default) |
| `rounded-xl` | 16px | Modals, featured cards |
| `rounded-2xl` | 24px | Hero panels |
| `rounded-full` | 9999px | Avatar, pill badges |

### Borders
- Default card: `border border-[#E2E8F0]` (1px solid)
- Active/selected card: `border-2 border-[#B8860B]`
- Input default: `border border-[#CBD5E1]`
- Input focus: `border-2 border-[#B8860B] outline-none`
- Table row: `border-b border-[#E2E8F0]`

### Shadows
| Level | CSS | Use |
|-------|-----|-----|
| none | — | Default card state |
| sm | `0 1px 3px rgba(0,0,0,0.06)` | Card hover lift |
| md | `0 4px 12px rgba(0,0,0,0.08)` | Dropdowns, tooltips |
| lg | `0 20px 40px rgba(0,0,0,0.12)` | Modals |

**Rule:** Shadows on hover or floating elements only. Never static decorative shadows.

### Key Components

**Button — Primary**
```
bg-[#B8860B] text-white font-semibold text-sm
px-4 py-2 rounded-md
hover:bg-[#9A700A] transition-colors
```

**Button — Ghost**
```
border border-[#B8860B] text-[#B8860B] font-semibold text-sm
px-4 py-2 rounded-md
hover:bg-[#FEF3C7] transition-colors
```

**Badge — Winner**
```
bg-[#F0FDF4] text-[#16A34A] font-medium text-xs tracking-wider
px-2.5 py-0.5 rounded-full uppercase
```

**Badge — Neutral / Loser**
```
bg-[#F1F5F9] text-[#94A3B8] font-medium text-xs tracking-wider
px-2.5 py-0.5 rounded-full uppercase
```

**Score Bar**
```
height: 6px, rounded-full
winner fill: #16A34A
loser fill:  #E2E8F0
track bg:    #E2E8F0
```

---

## Tailwind Config Tokens

```js
// tailwind.config.ts — extend.colors
colors: {
  accent:      '#B8860B',
  'accent-hover': '#9A700A',
  'accent-light': '#FEF3C7',
  winner:      '#16A34A',
  'winner-bg': '#F0FDF4',
  surface:     '#FFFFFF',
  'surface-alt': '#F1F5F9',
  border:      '#E2E8F0',
  'border-strong': '#CBD5E1',
}
```

---

*Last updated: 2026-03-17*
