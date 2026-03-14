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
- NO images yet — image generation is deferred until R explicitly says otherwise
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

## DO NOT
- Ask about watch images — deferred, R will bring it up when ready
- Ask about domain setup — already live at watchvswatch.com
- Re-suggest affiliate links
