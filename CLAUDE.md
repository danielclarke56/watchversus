# WatchVsWatch — Agent Rules

Read this before doing anything.

## Project
- Live at: https://watchvswatch.com
- GitHub: https://github.com/danielclarke56/watchversus
- Stack: Next.js 14, TypeScript strict, Tailwind
- Deploy: Netlify (auto-deploys on push to master)
- **After every code change: `git add -A && git commit -m "..." && git push`**

## Hard Rules
- NO affiliate links, no affiliate URLs, no partner CTAs — anywhere in the codebase
- Images: 
  - **Press photos** (if available): Use official manufacturer press images. Currently 30 watches have JPGs. Keep these.
  - **AI renders** (for gap-fill): For the 32 watches with SVG placeholders, generate AI renders via OpenAI gpt-image-1. Save as `/public/images/watches/{slug}.png`. Transparent background, no logos/text on dial.
  - **User uploads** (future value): Users can submit their own watch photos via watch detail pages. Store in `/public/images/user-uploads/{slug}/`. Display in a "Community Photos" gallery below the main image.
- Only add more press photos if the brand explicitly grants permission in writing.
- TypeScript strict mode: no implicit any, movement_type must be `"automatic" | "manual" | "quartz"`
- PowerShell environment: use `;` not `&&` between commands

## Architecture
- `data/watches.json` — 50 watch records (no affiliate URL fields)
- `lib/watches.ts` — watch lookup functions
- `lib/types.ts` — Watch interface (no affiliate fields)
- `app/compare/[slug]/page.tsx` — 121 static comparison pages with FAQ + JSON-LD
- `app/watches/[slug]/page.tsx` — 50 static watch detail pages
- Domain canonical: `https://watchvswatch.com`

## Current Status (2026-03-14)
- Affiliate links fully removed (data + types + about page)
- 121 comparison pages live with FAQ schema
- SEO: canonical URLs, OG tags, JSON-LD structured data, sitemap

## Architecture Rules (Learned from bugs)

- **Single source of truth**: Never maintain parallel arrays/lists that must be kept in sync. If a list exists in a data file (`guideData.ts`, `watches.json`, etc.), derive from it — never hardcode a copy elsewhere. (Root cause of guides index bug, 2026-03-18)
- **Dynamic routing > static lists**: When Next.js supports dynamic slug routing, use it. Don't manually register pages that can be auto-discovered.
- **Validate before deploying**: Run `npm run validate` (if exists) before `npm run build`. The validate script catches slug mismatches, broken references, and missing data entries.

## Self-Improvement Logging

After every task, log to `C:\Users\daniel\.openclaw\workspace\.learnings\`:
- Unexpected errors → `ERRORS.md`
- Bug patterns worth preventing → `LEARNINGS.md`
- Better approaches discovered → `LEARNINGS.md`

## DO NOT
- Ask about domain setup — already live at watchvswatch.com
- Re-suggest affiliate links
- Create hardcoded lists that mirror data already in a TypeScript file
