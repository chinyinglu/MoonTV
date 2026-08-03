# Zhiying Cinema Brand Icon

## Direction

The icon uses a monochrome cinema clapperboard with a custom cut-angle `Z` aperture. Three small particles connect the mark to the site's Nordic minimal and technology-particle visual system. The palette is limited to near-black `#08090a` and warm white `#f5f5f0` for legibility at favicon scale.

## Asset system

- `public/favicon.svg`: master scalable favicon.`r`n- `public/icons/zhiying-cinema-*-v1.*`: immutable deployed copies that bypass CDN path caching.
- `public/favicon.ico`: 16, 32, 48, and 64 pixel browser fallback.
- `public/favicon.png`: 64 pixel PNG fallback.
- `public/icons/apple-touch-icon.png`: 180 pixel iOS home-screen icon.
- `public/icons/icon-{192,256,384,512}x{size}.png`: opaque PWA icons with mask-safe spacing.

The browser assets use a transparent rounded-square silhouette. Mobile assets are flattened onto the site's near-black background so iOS and Android masks do not introduce white seams.

## Integration and validation

Next.js metadata advertises immutable versioned SVG, PNG, ICO, and Apple Touch filenames. The generated web manifest marks mobile icons as `any maskable`. Validation covers TypeScript, ESLint, exact raster dimensions, SVG/ICO signatures, local HTTP content types, and the deployed Cloudflare responses.
