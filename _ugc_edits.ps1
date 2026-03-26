$ErrorActionPreference = 'Stop'
$base = 'C:\Users\daniel\.openclaw\workspace\business\projects\watchvswatch\site'

# 1. Add getRecentApprovedReviews to lib/reviews.ts
$reviewsFile = "$base\lib\reviews.ts"
$reviewsContent = Get-Content $reviewsFile -Raw
if ($reviewsContent -notmatch 'getRecentApprovedReviews') {
    $newFunction = @'

export async function getRecentApprovedReviews(limit = 4): Promise<Review[]> {
  try {
    const keys = await redis.keys('reviews:approved:*')
    if (!keys || keys.length === 0) return []
    
    const allReviews: Review[] = []
    for (const key of keys) {
      const reviews = await redis.lrange(key, 0, -1)
      for (const r of reviews) {
        try {
          const review = typeof r === 'string' ? JSON.parse(r) : r
          allReviews.push(review as Review)
        } catch {
          continue
        }
      }
    }
    
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return allReviews.slice(0, limit)
  } catch {
    return []
  }
}
'@
    $reviewsContent = $reviewsContent.TrimEnd() + "`n" + $newFunction + "`n"
    Set-Content $reviewsFile -Value $reviewsContent -NoNewline
    Write-Output "OK: Added getRecentApprovedReviews to lib/reviews.ts"
} else {
    Write-Output "SKIP: getRecentApprovedReviews already exists"
}

# 2. Add "See all photos" link to WatchGallery
$galleryFile = "$base\components\watch\WatchGallery.tsx"
$galleryContent = Get-Content $galleryFile -Raw
if ($galleryContent -notmatch 'See all photos') {
    # Find the closing tag of the component's outer div and add link before it
    # Look for the section with id="gallery" closing
    if ($galleryContent -match 'slug') {
        # Add a "See all photos" link. We'll add it after the upload section
        $galleryContent = $galleryContent -replace '(export default function WatchGallery\(\{[^}]*\})', '$1'
        # Simpler approach: add the link text within the component
        # Find the return statement and add after the first div
        $insertPattern = '(<section[^>]*id="gallery"[^>]*>)'
        if ($galleryContent -match $insertPattern) {
            # Already has section id=gallery, just add a link
        }
        # Let's just add it before the final closing tag of the component
        # Actually, let's add a prop for slug and add the link
    }
    Write-Output "NOTE: WatchGallery needs manual 'See all photos' link addition"
} else {
    Write-Output "SKIP: WatchGallery already has 'See all photos' link"
}

# 3. Add "See all reviews" link to UserReviewsSection
$reviewsSectionFile = "$base\components\UserReviewsSection.tsx"
$reviewsSectionContent = Get-Content $reviewsSectionFile -Raw
if ($reviewsSectionContent -notmatch 'See all reviews') {
    Write-Output "NOTE: UserReviewsSection needs manual 'See all reviews' link addition"
} else {
    Write-Output "SKIP: UserReviewsSection already has 'See all reviews' link"
}

Write-Output "Script complete. Manual edits needed for WatchGallery, UserReviewsSection, page reorders, Navigation, and sitemap."
