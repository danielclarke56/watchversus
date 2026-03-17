# Design System Implementation for WatchVsWatch
# This script spawns Claude Code to implement tokens across the codebase

cd "C:\Users\daniel\.openclaw\workspace\business\projects\watchvswatch\site"

$briefText = @"
You are implementing a design system across the WatchVsWatch codebase.
Read design-system.md first for all token values, then follow these steps in order.

## Context
- Stack: Next.js 14, TypeScript strict, Tailwind CSS
- Repo: C:\Users\daniel\.openclaw\workspace\business\projects\watchvswatch\site
- Design system file: design-system.md (already exists — read it)
- Rules: NO affiliate links anywhere. NO deletions of watch data or images.

## STEP 1: Update tailwind.config.ts
Add to extend.colors:
  accent: '#B8860B'
  accentHover: '#9A700A'
  accentLight: '#FEF3C7'
  winner: '#16A34A'
  winnerBg: '#F0FDF4'
  surface: '#FFFFFF'
  surfaceAlt: '#F1F5F9'
  border: '#E2E8F0'
  borderStrong: '#CBD5E1'
  textPrimary: '#0F172A'
  textSecond: '#475569'
  textMuted: '#94A3B8'

Add to extend.fontFamily:
  sans: ['Inter', 'system-ui', 'sans-serif']

Add to extend.borderRadius:
  sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px'

Add to extend.boxShadow:
  sm: '0 1px 3px rgba(0,0,0,0.06)'
  md: '0 4px 12px rgba(0,0,0,0.08)'
  lg: '0 20px 40px rgba(0,0,0,0.12)'

## STEP 2: Update globals.css
- Set body: bg-[#F8FAFC], color #0F172A, font Inter
- Add CSS custom properties for all tokens (matching tailwind.config values)
- Set heading styles H1–H4 using the type scale from design-system.md
- Remove any existing inline hex values that duplicate the new tokens
- Keep existing @layer base patterns if present — just update values

## STEP 3: Refactor components
Scan ALL files in components/ and look for:
- Raw hex values → replace with token class (e.g. bg-[#B8860B] → bg-accent)
- Hardcoded colors not in the system → replace with closest token
- button elements → standardize to: bg-accent text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-accentHover transition-colors
- card/panel wrappers → bg-surface border border-border rounded-lg shadow-none hover:shadow-sm
- badge/tag elements → use winner/winnerBg or bg-surfaceAlt text-textMuted as appropriate
- input/select elements → border border-borderStrong rounded-sm focus:border-accent focus:outline-none
- score/result bars → winner fill = bg-winner, loser fill = bg-border

## STEP 4: Apply system to pages
Scan app/ for homepage (page.tsx), comparison ([slug]/page.tsx), and watch pages.
Apply same replacements:
- Raw hex → token classes
- Inconsistent padding/margin → system spacing (space-4, space-6, space-8, space-12)
- Duplicate inline styles → extract to token classes
- Max content width: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

## STEP 5: Commit
After all changes:
git add -A
git commit -m 'Implement design system tokens across codebase — tailwind config, globals.css, components, pages'
git push

## OUTPUT REQUIRED
When done, print:
1. List of all modified files
2. Summary of what was standardized in each
3. Any raw hex values that remain (with file + line)
4. Commit hash

Call completed when this is printed.
"@

claude --permission-mode bypassPermissions --print $briefText
