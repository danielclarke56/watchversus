# Watchems — Agent Rules

Read this before doing anything.

## Project
- Live at: https://watchems.com
- GitHub: https://github.com/danielclarke56/watchversus
- Stack: Next.js 14, TypeScript strict, Tailwind
- Deploy: Vercel (auto-deploys on push to master)
- **Do NOT auto-commit or push.** Make changes locally, let the user test, then commit only when asked.

## Hard Rules
- NO affiliate links, no affiliate URLs, no partner CTAs — anywhere in the codebase
- NO social/community features — Watchems is a visual reference library, not a social platform
- TypeScript strict mode: no implicit any
- `data/watches.json` is DELETED — do not recreate it. Neon DB is the only source of truth.

## Architecture
- **Database**: Neon PostgreSQL via Drizzle ORM (`lib/db/`, `lib/db/schema.ts`)
- **Schema**: `photos`, `photoLikes`, `collections`, `collectionItems`, `users`, `wristChecks`
- **Auth**: Clerk (`@clerk/nextjs`)
- **Storage**: Cloudflare R2 for photo files (`lib/r2.ts`)
- **Email**: Resend for transactional emails (`lib/email.ts`)
  - Templates stored as HTML files in `lib/email-templates/`
  - `photo-approved.html` — single photo approval (uses `{{firstName}}`, `{{slug}}`, `{{imageUrl}}`, `{{brand}}`, `{{model}}`, `{{reference}}`)
  - `photo-rejected.html` — rejection with reason
  - Bulk approval (2+ photos) uses inline HTML in `sendPhotoBulkApprovedEmail()`
- **AI**: Google Gemini for watch identification (`lib/gemini.ts` or similar)
- **Rate limiting**: `lib/ratelimit.ts`

## Key Pages
- `/` — Photo gallery (infinite scroll, filters, lightbox)
- `/photo/[id]` — Individual photo page
- `/upload` — Photo submission flow
- `/dashboard` — My Watches (user's submitted photos + stats)
- `/dashboard/wrist-check` — Daily wear logging with calendar
- `/dashboard/boards` — Collections (saved watches into themed boards)
- `/dashboard/liked` — Liked photos
- `/dashboard/profile` — Profile + avatar
- `/admin/photos` — Photo moderation queue (approve/reject/crop/reorder)
- `/admin/reviews` — Review moderation

## Watch Identity
There is NO watches table. A "watch" is identified by `watchId` (slug like `omega-seamaster-300m`) on the `photos` table. Watch metadata (brand, model, reference) lives on each photo record. When displaying watch name, derive from `[brandName, modelName].filter(Boolean).join(' ') || unslugify(watchId)`.

## Photo Approval Flow
- Admin approves a group of photos via `POST /api/admin/photos` with `action: 'bulk-approve'`
- Sends ONE summary email regardless of how many photos are in the batch
- Single photo batches use the `photo-approved.html` template
- Multi-photo batches use inline HTML with a photo list + dashboard nav links

## Architecture Rules (Learned from bugs)
- **Single source of truth**: Neon DB only. Never recreate static JSON data files.
- **Dynamic routing > static lists**: Use Next.js dynamic slug routing, don't manually register pages.
- **No static watch catalogue**: Watch identity is derived from photo submissions, not a predefined list.
- **`npm run validate` is removed** — the script that used watches.json is deleted.

## DO NOT
- Ask about domain setup — already live at watchems.com
- Re-suggest affiliate links
- Recreate `data/watches.json` or `lib/watches.ts`
- Add social feed, follower, or community engagement features
- Create hardcoded lists that mirror data already in the DB
