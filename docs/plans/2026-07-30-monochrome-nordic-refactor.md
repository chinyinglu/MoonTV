# Monochrome Nordic interface refactor

## Direction

A quiet Nordic cinema library: strong editorial typography, generous negative space, thin neutral borders, and high-contrast controls. Film artwork provides color; the product chrome stays black, white, and gray. A sparse particle matrix and soft orbital glows add a modern technology layer.

## Information architecture

- Persistent desktop rail and compact mobile dock.
- Home: focused feature carousel, resume row, movie row, series row.
- Search/category: consistent page heading, filter controls, grid cards, explicit loading/empty/error states.
- Detail/play: one continuous media flow with playback first and synchronized archive data second.
- Admin/login: same tokens and accessible controls, while semantic destructive states may use muted red.

## Interaction rules

- Carousel buttons are independent controls above all overlays; no pointer capture on the hero container.
- Touch uses horizontal swipe; keyboard uses left/right arrows; auto-advance pauses on hover/focus.
- Cards lift no more than 4px and images scale no more than 2%.
- All interactive elements expose a visible `:focus-visible` ring.
- Motion respects `prefers-reduced-motion`.

## Acceptance criteria

- Light and dark themes both meet readable text contrast.
- No violet/cyan brand chrome remains in primary shared components.
- Carousel previous/next controls switch content reliably.
- Desktop and mobile navigation remain usable.
- TypeScript, ESLint, and `git diff --check` pass.
- Home, detail, and play pages are visually verified in the browser.
