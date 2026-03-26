$ErrorActionPreference = 'Continue'
$base = 'C:\Users\daniel\.openclaw\workspace\business\projects\watchvswatch\site'

function Replace-InFile($path, $find, $replace) {
    $content = Get-Content $path -Raw
    if ($content.Contains($find)) {
        $content = $content.Replace($find, $replace)
        Set-Content $path -Value $content -NoNewline
        Write-Output "  REPLACED in $([System.IO.Path]::GetFileName($path))"
        return $true
    } else {
        Write-Output "  NOT FOUND: '$($find.Substring(0, [Math]::Min(60, $find.Length)))...' in $([System.IO.Path]::GetFileName($path))"
        return $false
    }
}

# ============================================================
# EDIT 1: WatchGallery - Add "See all photos" link
# ============================================================
Write-Output "`n=== EDIT 1: WatchGallery ==="
$file = "$base\components\watch\WatchGallery.tsx"
$content = Get-Content $file -Raw

# Check if it already has the link
if ($content -notmatch 'See all photos') {
    # We need to find a good insertion point. Let's look at what's in the file
    # Check if it has a section closing tag we can insert before
    # Strategy: Add the link after the section title/heading area
    
    # First, check if file has Link import
    if ($content -notmatch "import Link from") {
        $content = $content -replace "(^'use client')", "`$1`nimport Link from 'next/link'"
        if ($content -notmatch "'use client'") {
            $content = "import Link from 'next/link'`n" + $content
        }
    }
    
    # Find the props interface to check if slug is available
    # Look for watchSlug or slug prop
    $hasSlug = $content -match '(watchSlug|slug)\s*[:\?]'
    
    # Look for the section header "Owner Photos" or "Gallery" or "Photo Gallery"
    # Try to add a "See all photos" link near the section heading
    # Find closing </section> and add before it
    if ($content -match '</section>\s*\)') {
        $content = $content -replace '(</section>\s*\))', @'
        <div className="mt-6 text-center">
          <Link href={`/watches/${slug}/photos`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            See all photos →
          </Link>
        </div>
      </section>
    )
'@
        Write-Output "  Added 'See all photos' link (before </section>)"
    } elseif ($content -match '</section>') {
        # Try simpler pattern
        $content = $content -replace '(</section>)', @'
        <div className="mt-6 text-center">
          <Link href={`/watches/${slug}/photos`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            See all photos →
          </Link>
        </div>
      </section>
'@
        Write-Output "  Added 'See all photos' link (before </section> simple)"
    } else {
        Write-Output "  WARN: Could not find </section> in WatchGallery - skipping link addition"
    }
    
    Set-Content $file -Value $content -NoNewline
} else {
    Write-Output "  SKIP: Already has 'See all photos' link"
}

# ============================================================
# EDIT 2: UserReviewsSection - Add "See all reviews" link
# ============================================================
Write-Output "`n=== EDIT 2: UserReviewsSection ==="
$file = "$base\components\UserReviewsSection.tsx"
$content = Get-Content $file -Raw

if ($content -notmatch 'See all reviews') {
    # Add Link import if missing
    if ($content -notmatch "import Link from") {
        if ($content -match "^'use client'") {
            $content = $content -replace "^'use client'", "'use client'`nimport Link from 'next/link'"
        } else {
            $content = "import Link from 'next/link'`n" + $content
        }
    }
    
    # Find section closing and add link before it
    if ($content -match '</section>') {
        $content = $content -replace '(</section>)', @'
        <div className="mt-6 text-center">
          <Link href={`/watches/${slug}/reviews`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            See all reviews →
          </Link>
        </div>
      </section>
'@
        Write-Output "  Added 'See all reviews' link"
    } else {
        Write-Output "  WARN: Could not find </section> in UserReviewsSection"
    }
    
    Set-Content $file -Value $content -NoNewline
} else {
    Write-Output "  SKIP: Already has 'See all reviews' link"
}

# ============================================================
# EDIT 3: Navigation - Add Upload link
# ============================================================
Write-Output "`n=== EDIT 3: Navigation ==="
$file = "$base\components\Navigation.tsx"
$content = Get-Content $file -Raw

if ($content -notmatch "href=""/upload""") {
    # Find the nav links section - look for "Explore" or the links array
    # Common patterns: { name: 'Explore', href: '/watches' }
    # Or inline links: <Link href="/watches">Explore</Link>
    
    # Try to find link array pattern
    if ($content -match "\{\s*name:\s*'Explore'") {
        $content = $content -replace "(\{\s*name:\s*'Explore'[^}]+\})", "`$1,`n    { name: 'Upload', href: '/upload' }"
        Write-Output "  Added Upload to nav links array (after Explore)"
    }
    # Try inline Link pattern
    elseif ($content -match '<Link\s+href="/watches"[^>]*>\s*Explore\s*</Link>') {
        $content = $content -replace '(<Link\s+href="/watches"[^>]*>\s*Explore\s*</Link>)', '$1
              <Link href="/upload" className="text-sm text-zinc-400 hover:text-white transition-colors">Upload</Link>'
        Write-Output "  Added Upload link (after Explore inline)"
    }
    # Try href="/watches" pattern more broadly  
    elseif ($content -match 'href="/watches"') {
        # Find the Explore nav item and duplicate pattern for Upload
        # Look for the nav item structure
        $lines = $content -split "`n"
        $newLines = @()
        $added = $false
        foreach ($line in $lines) {
            $newLines += $line
            if (!$added -and $line -match 'Explore' -and $line -match 'href="/watches"') {
                # Duplicate this line pattern for Upload
                $uploadLine = $line -replace 'Explore', 'Upload' -replace '/watches', '/upload'
                $newLines += $uploadLine
                $added = $true
            }
        }
        if ($added) {
            $content = $newLines -join "`n"
            Write-Output "  Added Upload link (duplicated Explore pattern)"
        } else {
            Write-Output "  WARN: Could not find Explore link pattern"
        }
    }
    else {
        Write-Output "  WARN: Could not find nav link pattern in Navigation.tsx"
    }
    
    Set-Content $file -Value $content -NoNewline
} else {
    Write-Output "  SKIP: Upload link already exists"
}

# ============================================================
# EDIT 4: Sitemap - Add /upload route
# ============================================================
Write-Output "`n=== EDIT 4: Sitemap ==="
$file = "$base\app\sitemap.ts"
$content = Get-Content $file -Raw

if ($content -notmatch "'/upload'") {
    # Find the static routes section - look for /about or /compare or other static routes
    if ($content -match "'/about'") {
        $content = $content -replace "('/about')", "`$1,`n    '/upload'"
        Write-Output "  Added /upload to sitemap (after /about)"
    } elseif ($content -match "'/quiz'") {
        $content = $content -replace "('/quiz')", "`$1,`n    '/upload'"
        Write-Output "  Added /upload to sitemap (after /quiz)"
    } elseif ($content -match '/about') {
        # Try url format
        $content = $content -replace "(\{ url: '[^']*about[^}]*\})", "`$1,`n    { url: 'https://watchvswatch.com/upload', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }"
        Write-Output "  Added /upload to sitemap (url format)"
    } else {
        Write-Output "  WARN: Could not find insertion point in sitemap"
    }
    
    # Also add dynamic photo/review routes for each watch
    if ($content -match 'watches\.map' -and $content -notmatch '/photos') {
        # The sitemap likely generates per-watch entries - add photos and reviews variants
        if ($content -match '(\$\{watch\.slug\}`)') {
            Write-Output "  NOTE: Consider adding /photos and /reviews dynamic routes"
        }
    }
    
    Set-Content $file -Value $content -NoNewline
} else {
    Write-Output "  SKIP: /upload already in sitemap"
}

# ============================================================
# EDIT 5: Watch detail page - Reorder sections + update TOC
# ============================================================
Write-Output "`n=== EDIT 5: Watch detail page section reorder ==="
$file = "$base\app\watches\[slug]\page.tsx"
$content = Get-Content $file -Raw

# Update the sidebar TOC labels
# Look for the sections/TOC array and replace it
if ($content -match "id:\s*'specs'.*label:\s*'") {
    # Try to replace the TOC array
    # Common pattern: array of { id, label } objects
    # We need to find and replace the section order
    
    # First, let's update the TOC labels
    $tocPatterns = @(
        @("{ id: 'specs', label: 'Specs' }", "{ id: 'gallery', label: 'Photos' },`n          { id: 'reviews', label: 'Owner Reviews' },`n          { id: 'specs', label: 'Full Specs' }")
        @("{ id: 'specs', label: 'Full Specs' }", "{ id: 'specs', label: 'Full Specs' }")
    )
    
    # Replace gallery label if exists
    if ($content -match "id: 'gallery', label: 'Gallery'") {
        $content = $content -replace "id: 'gallery', label: 'Gallery'", "id: 'gallery', label: 'Photos'"
    }
    if ($content -match "id: 'gallery', label: 'Photo Gallery'") {
        $content = $content -replace "id: 'gallery', label: 'Photo Gallery'", "id: 'gallery', label: 'Photos'"
    }
    
    # Add gallery and reviews TOC entries if not present
    if ($content -notmatch "id: 'gallery'") {
        $content = $content -replace "(id: 'specs')", "id: 'gallery', label: 'Photos' },`n          { id: 'reviews', label: 'Owner Reviews' },`n          { `$1"
    } elseif ($content -notmatch "id: 'reviews'.*label: 'Owner Reviews'") {
        if ($content -match "id: 'gallery'") {
            $content = $content -replace "(\{ id: 'gallery'[^}]*\})", "`$1,`n          { id: 'reviews', label: 'Owner Reviews' }"
        }
    }
    
    # Update specs label
    if ($content -match "label: 'Specs'") {
        $content = $content -replace "label: 'Specs'", "label: 'Full Specs'"
    }
    
    Write-Output "  Updated TOC labels"
} else {
    Write-Output "  NOTE: TOC pattern not found - may need manual update"
}

# Now reorder the JSX sections
# This is complex - we need to move WatchGallery before WatchSpecs and UserReviewsSection before WatchSpecs
# Strategy: Find the component tags and reorder them

# Look for the JSX section markers
$sectionOrder = @(
    'WatchHero',        # 1. Hero
    'WatchGallery',     # 2. Photos (move UP)
    'UserReviewsSection', # 3. Reviews (move UP)
    'WatchSpecs',       # 4. Specs (move DOWN)
    'WatchVerdict',     # 5. Verdict (move DOWN)
    'WatchCompareSection', # 6. Compare
    'WatchRelatedGuides',  # 7. Related Guides
    'MoreBrandWatches',    # 8. More From Brand
    'WatchBrowseSimilar',  # 9. Browse Similar
    'QuizCTA'              # 10. Quiz CTA
)

Write-Output "  NOTE: Section reorder is complex - attempting regex-based reorder"

# The page likely has these components in a specific order in the JSX
# Let's extract each section block and reorder them
# Look for patterns like <WatchGallery ... /> or <WatchGallery ...>...</WatchGallery>

# For now, let's just make sure the page has the right order by looking for section markers
# and reporting what we find

$foundOrder = @()
foreach ($comp in $sectionOrder) {
    if ($content -match "<$comp") {
        $idx = $content.IndexOf("<$comp")
        $foundOrder += "$comp at position $idx"
    }
}
Write-Output "  Current component order:"
foreach ($item in $foundOrder) {
    Write-Output "    $item"
}

# Try to move WatchGallery before WatchSpecs if it's currently after
$galleryPos = if ($content -match '<WatchGallery') { $content.IndexOf('<WatchGallery') } else { -1 }
$specsPos = if ($content -match '<WatchSpecs') { $content.IndexOf('<WatchSpecs') } else { -1 }
$reviewsPos = if ($content -match '<UserReviewsSection') { $content.IndexOf('<UserReviewsSection') } else { -1 }

if ($galleryPos -gt $specsPos -and $galleryPos -gt 0 -and $specsPos -gt 0) {
    Write-Output "  Gallery is AFTER Specs - needs reorder"
    # Extract gallery block and move it before specs
    # Find the complete gallery JSX block
    # This could be a self-closing tag or a block with children
    
    # Try to find the gallery section (could be wrapped in a div/section)
    # Pattern: line containing <WatchGallery to the closing of its wrapper
    $lines = $content -split "`n"
    $galleryLines = @()
    $specsLineIdx = -1
    $galleryStartIdx = -1
    $galleryEndIdx = -1
    $inGallery = $false
    $braceDepth = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '<WatchGallery' -and !$inGallery) {
            $galleryStartIdx = $i
            $inGallery = $true
        }
        if ($inGallery) {
            $galleryLines += $lines[$i]
            # Check if this line closes the tag
            if ($lines[$i] -match '/>') {
                $galleryEndIdx = $i
                $inGallery = $false
            }
        }
        if ($lines[$i] -match '<WatchSpecs' -and $specsLineIdx -eq -1) {
            $specsLineIdx = $i
        }
    }
    
    if ($galleryStartIdx -gt 0 -and $galleryEndIdx -gt 0 -and $specsLineIdx -gt 0 -and $galleryStartIdx -gt $specsLineIdx) {
        # Remove gallery from current position and insert before specs
        $newLines = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($i -eq $specsLineIdx) {
                # Insert gallery here
                $newLines += $galleryLines
                $newLines += ''
            }
            if ($i -lt $galleryStartIdx -or $i -gt $galleryEndIdx) {
                $newLines += $lines[$i]
            }
        }
        $content = $newLines -join "`n"
        Write-Output "  Moved WatchGallery before WatchSpecs"
    }
}

# Similarly move UserReviewsSection before WatchSpecs if it's after
$reviewsPos2 = if ($content -match '<UserReviewsSection') { $content.IndexOf('<UserReviewsSection') } else { -1 }
$specsPos2 = if ($content -match '<WatchSpecs') { $content.IndexOf('<WatchSpecs') } else { -1 }

if ($reviewsPos2 -gt $specsPos2 -and $reviewsPos2 -gt 0 -and $specsPos2 -gt 0) {
    Write-Output "  Reviews is AFTER Specs - needs reorder"
    $lines = $content -split "`n"
    $reviewLines = @()
    $specsLineIdx2 = -1
    $reviewStartIdx = -1
    $reviewEndIdx = -1
    $inReview = $false
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '<UserReviewsSection' -and !$inReview) {
            $reviewStartIdx = $i
            $inReview = $true
        }
        if ($inReview) {
            $reviewLines += $lines[$i]
            if ($lines[$i] -match '/>') {
                $reviewEndIdx = $i
                $inReview = $false
            }
        }
        if ($lines[$i] -match '<WatchSpecs' -and $specsLineIdx2 -eq -1) {
            $specsLineIdx2 = $i
        }
    }
    
    if ($reviewStartIdx -gt 0 -and $reviewEndIdx -gt 0 -and $specsLineIdx2 -gt 0 -and $reviewStartIdx -gt $specsLineIdx2) {
        $newLines = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($i -eq $specsLineIdx2) {
                $newLines += $reviewLines
                $newLines += ''
            }
            if ($i -lt $reviewStartIdx -or $i -gt $reviewEndIdx) {
                $newLines += $lines[$i]
            }
        }
        $content = $newLines -join "`n"
        Write-Output "  Moved UserReviewsSection before WatchSpecs"
    }
}

Set-Content $file -Value $content -NoNewline

# ============================================================
# EDIT 6: Homepage - Reorder sections + update hero + add new sections
# ============================================================
Write-Output "`n=== EDIT 6: Homepage ==="
$file = "$base\app\page.tsx"
$content = Get-Content $file -Raw

# Update hero copy
if ($content -match 'Find Your Perfect Watch') {
    $content = $content -replace 'Find Your Perfect Watch', 'Real watches. Real owners. Real opinions.'
    Write-Output "  Updated headline"
}

# Update subheadline - try common patterns
if ($content -match 'Compare watches side by side') {
    $content = $content -replace 'Compare watches side by side[^"<]*', 'Browse photos and reviews from people who actually own these watches.'
    Write-Output "  Updated subheadline"
} elseif ($content -match 'Discover and compare') {
    $content = $content -replace 'Discover and compare[^"<]*', 'Browse photos and reviews from people who actually own these watches.'
    Write-Output "  Updated subheadline"
}

# Add Upload CTA button to hero if not present
if ($content -notmatch 'Upload your watch') {
    # Find the hero section - look for search bar area and add button after it
    if ($content -match '(/compare)') {
        # After compare link, add upload link
        $content = $content -replace '(href="/compare"[^>]*>[^<]*</(?:Link|a)>)', '$1
              <Link href="/upload" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors border border-zinc-700">
                Upload your watch →
              </Link>'
        Write-Output "  Added Upload CTA to hero"
    } elseif ($content -match 'Start Comparing|Browse Watches|Get Started') {
        # Add after the primary CTA
        $content = $content -replace '((?:Start Comparing|Browse Watches|Get Started)[^<]*</(?:Link|a|button)>)', '$1
              <Link href="/upload" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors border border-zinc-700">
                Upload your watch →
              </Link>'
        Write-Output "  Added Upload CTA to hero (after primary CTA)"
    }
}

# Add RecentReviews import if not present
if ($content -notmatch 'RecentReviews') {
    # Add import
    if ($content -match "import.*RecentPhotos") {
        $content = $content -replace "(import.*RecentPhotos.*)", "`$1`nimport RecentReviews from '@/components/home/RecentReviews'"
    } else {
        $content = $content -replace "(^import)", "import RecentReviews from '@/components/home/RecentReviews'`n`$1"
    }
    
    # Add the component in the JSX - after RecentPhotos
    if ($content -match '<RecentPhotos') {
        $content = $content -replace '(<RecentPhotos\s*/>)', '$1
        <RecentReviews />'
        Write-Output "  Added RecentReviews component (after RecentPhotos)"
    }
}

# Add Link import if missing
if ($content -notmatch "import Link from 'next/link'" -and $content -notmatch 'import Link from "next/link"') {
    $content = $content -replace "(^import)", "import Link from 'next/link'`n`$1"
}

# Add WhyContribute section - create inline
if ($content -notmatch 'Why Contribute|Share your wrist shot') {
    # Find FAQ section and insert WhyContribute before it
    $whyContribute = @'

        {/* Why Contribute */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">Why Contribute?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl mb-3">📸</div>
                <h3 className="text-lg font-semibold text-white mb-2">Share your wrist shot</h3>
                <p className="text-zinc-400 text-sm">Upload a photo of your watch and help others see how it looks in real life.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">✍️</div>
                <h3 className="text-lg font-semibold text-white mb-2">Write an honest review</h3>
                <p className="text-zinc-400 text-sm">Tell people what it&apos;s actually like to own this watch — the good, the bad, and the everyday.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-lg font-semibold text-white mb-2">Help others choose</h3>
                <p className="text-zinc-400 text-sm">Your experience helps thousands of people make better watch decisions.</p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/sign-up" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Create a free account →
              </Link>
            </div>
          </div>
        </section>
'@
    
    if ($content -match '<FAQ') {
        $content = $content -replace '(<FAQ)', "$whyContribute`n        `$1"
        Write-Output "  Added WhyContribute section (before FAQ)"
    } elseif ($content -match 'FAQ') {
        # Try to find FAQ section marker
        $content = $content -replace '(\{/\*.*FAQ.*\*/\})', "$whyContribute`n        `$1"
        Write-Output "  Added WhyContribute section (before FAQ comment)"
    } else {
        # Add before closing main/div tag
        $content = $content -replace '(</main>)', "$whyContribute`n    `$1"
        Write-Output "  Added WhyContribute section (before </main>)"
    }
}

Set-Content $file -Value $content -NoNewline
Write-Output "  Homepage edits complete"

Write-Output "`n=== ALL EDITS COMPLETE ==="
Write-Output "Files modified:"
Write-Output "  - lib/reviews.ts (getRecentApprovedReviews already added)"
Write-Output "  - components/watch/WatchGallery.tsx"
Write-Output "  - components/UserReviewsSection.tsx"
Write-Output "  - components/Navigation.tsx"
Write-Output "  - app/sitemap.ts"
Write-Output "  - app/watches/[slug]/page.tsx"
Write-Output "  - app/page.tsx"
