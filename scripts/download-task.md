# Task: Download Official Press Images for Missing Watches

Read CLAUDE.md first.

## Goal
Download official manufacturer press/product images for the 20 watches that currently only have SVG placeholders (no JPG).

## Rules
- Download ONLY from official brand websites (rolex.com, omegawatches.com, patek.com, etc.)
- Only use images from official product pages or press rooms — not third-party sites, not watermarked images
- Save as /public/images/watches/{slug}.jpg
- If a brand's image cannot be found cleanly, skip it and log it

## Watches needing images (SVG-only)
1. ap-royal-oak-15500 — Audemars Piguet Royal Oak 15500
2. baltic-bicompax-001 — Baltic Bicompax 001
3. cartier-santos — Cartier Santos
4. cartier-tank-must — Cartier Tank Must
5. frederique-constant-classics-auto — Frederique Constant Classics Automatic
6. halios-seaforth — Halios Seaforth
7. halios-tropik — Halios Tropik
8. iwc-pilot-mark-xviii — IWC Pilot Mark XVIII
9. nomos-tangente-38 — NOMOS Tangente 38
10. panerai-luminor-44-pam01312 — Panerai Luminor 44 PAM01312
11. patek-philippe-nautilus-5711 — Patek Philippe Nautilus 5711
12. rolex-datejust-36 — Rolex Datejust 36
13. rolex-day-date-40 — Rolex Day-Date 40
14. rolex-explorer-36 — Rolex Explorer 36
15. rolex-gmt-master-ii-pepsi — Rolex GMT-Master II Pepsi
16. rolex-submariner-41 — Rolex Submariner 41
17. rolex-yacht-master-40 — Rolex Yacht-Master 40
18. swatch-sistem51 — Swatch Sistem51
19. vacheron-constantin-overseas-4500v — Vacheron Constantin Overseas 4500V
20. zenith-el-primero-chronomaster — Zenith El Primero Chronomaster

## Approach
Write a Node.js script at scripts/download-brand-images.mjs that:
1. Uses node-fetch or https module to download images
2. For each watch, tries the most likely official URL pattern from the brand site
3. If download succeeds and file is a valid image (>50KB), saves it
4. Logs success/fail per watch

Official URL patterns to try per brand:
- Rolex: https://www.rolex.com/content/dam/rolex/... (use browser to find exact URL for each model)
- Omega: https://www.omegawatches.com/...
- Patek: https://www.patek.com/...
- AP: https://www.audemarspiguet.com/...
- IWC: https://www.iwc.com/...
- Cartier: https://www.cartier.com/...
- Panerai: https://www.panerai.com/...
- NOMOS: https://www.nomos-glashuette.com/...
- Frederique Constant: https://www.frederique-constant.com/...
- Vacheron: https://www.vacheron-constantin.com/...
- Zenith: https://www.zenith-watches.com/...
- Swatch: https://www.swatch.com/...
- Baltic: https://www.balticwatches.com/...
- Halios: https://www.halioswatches.com/...

Use a browser automation approach (Playwright) to:
1. Navigate to the brand's official product page for the specific model
2. Find the main product image element
3. Get the image URL
4. Download the highest-resolution version available
5. Save as /public/images/watches/{slug}.jpg

If Playwright is not available, use fetch with proper headers (User-Agent: Mozilla/5.0...).

## After download:
- Report how many images were successfully downloaded
- List any that failed
- Run: git add -A && git commit -m "feat: add official press images for premium watches" && git push

## Notify on completion:
Run: npx openclaw system event --text "Done: Downloaded brand press images. Check results." --mode now
