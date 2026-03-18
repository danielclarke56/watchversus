# WVW Builder Learnings

## 2026-03-18 — UX P1 Improvements

### LRN-001: IntersectionObserver for sticky headers
- Using IntersectionObserver on the hero section is cleaner than scroll position tracking for show/hide logic
- rootMargin `-80px` accounts for the nav bar height offset

### LRN-002: Mobile-first spec tables
- 3-column grids don't work well on mobile for spec comparisons — stacked card layout with watch name labels is more readable
- Hidden desktop headers + visible mobile labels via `hidden sm:grid` / `sm:hidden` pattern

### LRN-003: Dynamic verdict generation
- `getVerdictInfo()` derives winner from existing `preferredWatch` logic and generates contextual summaries
- Avoids hardcoded verdicts — scales with new comparisons automatically

### LRN-004: Tailwind color tokens
- Design system uses `accent` (#5C5C5C charcoal), `winner` (#16a34a green), `winnerBg` (#f0fdf4)
- Old gold (#b8860b) was still present in ComparisonStickyNav — cleaned up
