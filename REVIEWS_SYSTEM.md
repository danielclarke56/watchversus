# Review Submission System Documentation

## Overview
This document describes the complete review submission pipeline implemented for Watchems, enabling authenticated users to submit and manage watch reviews.

## Architecture

### Storage
- **Redis Backend**: Upstash Redis (connected via Vercel KV)
- **Schema**:
  - Review record: `review:{watchSlug}:{reviewId}` → `{ id, watchSlug, userId, rating, title, body, pros, cons, submittedAt, status }`
  - Pending index: `reviews:pending` (sorted set by timestamp)
  - Approved index: `reviews:approved:{watchSlug}` (sorted set)

### Authentication
- **Clerk**: Authenticates users (required for review submission)
- **Admin access**: Controlled via `ADMIN_USER_ID` environment variable

## Components & Files

### Core Library (`lib/reviews.ts`)
Provides server-side functions for review management:
- `submitReview()` - Save new review as "pending"
- `getPendingReviews()` - Fetch all pending reviews (admin)
- `getApprovedReviewsForWatch()` - Fetch approved reviews for a specific watch
- `approveReview()` - Mark review as approved and add to approved index
- `rejectReview()` - Mark review as rejected

### UI Components

#### `ReviewForm.tsx` (Client)
- Form for authenticated users to submit reviews
- Validates: rating (1-5), title (3-100 chars), body (10-2000 chars), pros/cons (1-10 items)
- Checks for affiliate links and rejects if found
- Success/error feedback with optimistic state reset

#### `ReviewsList.tsx` (Client)
- Displays approved reviews with rating stars and pros/cons
- Sorts by most recent first
- Shows formatted relative timestamps (e.g., "2d ago")

#### `UserReviewsSection.tsx` (Client)
- Combines review form and reviews list
- Shows sign-in CTA for non-authenticated users
- Receives initial reviews from server (for SSR)

### Pages

#### `/watches/[slug]/page.tsx` (Updated)
- Now async to fetch user reviews server-side
- Passes `initialReviews` to `UserReviewsSection`
- Reviews display below existing watch specifications

#### `/admin/reviews/page.tsx` (New)
- Lists all pending reviews awaiting moderation
- Approve/Reject buttons with inline processing
- Admin-only access (checks `ADMIN_USER_ID`)

#### `/admin/page.tsx` (New)
- Admin dashboard with links to moderation pages
- Simple navigation hub for future admin features

### API Routes

#### `POST /api/reviews`
- **Auth**: Required (Clerk)
- **Validation**: 
  - Rating: 1-5
  - Title: 3-100 characters
  - Body: 10-2000 characters
  - Pros/Cons: 1-10 items each
  - No affiliate link patterns (amazon.com, amzn.to, ref=, etc.)
- **Response**: 201 with review object, queued for moderation

#### `GET /api/admin/reviews`
- **Auth**: Admin only
- **Response**: Array of all pending reviews

#### `POST /api/admin/reviews/[id]`
- **Auth**: Admin only
- **Body**: `{ watchSlug: string, action: "approve" | "reject" }`
- **Actions**:
  - `approve`: Moves review to `reviews:approved:{watchSlug}`
  - `reject`: Marks as rejected and removes from pending
- **Response**: 200 success or error message

## Environment Variables

Add these to `.env.local` or Vercel deployment settings:

```bash
# Admin user ID (from Clerk)
ADMIN_USER_ID=user_xxxxx
NEXT_PUBLIC_ADMIN_USER_ID=user_xxxxx  # Also needed for client-side checks
```

## Workflow

### User Submission
1. User signs in with Clerk
2. Navigates to watch detail page
3. Scrolls to "Community Reviews" section
4. Fills review form (rating, title, body, pros, cons)
5. Submits review
6. Review saved as "pending" in Redis
7. Success message shown to user

### Admin Moderation
1. Admin navigates to `/admin/reviews`
2. Sees list of all pending reviews
3. Reviews content for quality/affiliate links
4. Clicks "Approve" or "Reject"
5. Approved reviews appear on watch pages
6. Rejected reviews are deleted

### Display
- Approved reviews appear on watch detail pages
- Sorted by most recent first
- Show rating, title, body, pros/cons
- Display relative timestamp ("2d ago")

## Security & Validation

- ✅ Affiliate link detection: amazon.com, amzn.to, ref= patterns
- ✅ Input validation on all fields (length, type, range)
- ✅ TypeScript strict mode (no implicit any)
- ✅ Admin authentication via Clerk
- ✅ Rate limiting (handled by Vercel)

## Testing

### Local Development
```bash
# Start dev server
npm run dev

# Build locally
npm run build
```

### Test Scenarios
1. **Submit Review**: Sign in, go to /watches/[slug], fill form, submit
2. **Approve Review**: Sign in as admin, go to /admin/reviews, click Approve
3. **Reject Review**: Sign in as admin, go to /admin/reviews, click Reject
4. **View Reviews**: Check watch page for approved reviews in "Community Reviews" section

## Future Enhancements

- Review helpfulness voting
- User review history
- Review filtering/sorting (by rating, recency, etc.)
- Email notifications for review approvals
- Bulk actions for admin moderation
- Review analytics dashboard

## TypeScript Types

All review operations use strict TypeScript with the following types:

```typescript
interface Review {
  id: string
  watchSlug: string
  userId: string
  rating: number // 1-5
  title: string
  body: string
  pros: string[]
  cons: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}
```
