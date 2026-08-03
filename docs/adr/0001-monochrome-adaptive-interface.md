# ADR-0001: Monochrome adaptive interface system

## Status

Accepted

## Context

The current interface mixes violet, cyan, green, glass gradients, and page-specific spacing. Shared navigation, cards, detail views, and playback controls do not form one coherent product. The refactor must preserve search, playback, source switching, favorites, authentication, and storage behavior while supporting both light and dark themes.

## Decision

Adopt a shared monochrome design system implemented with CSS custom properties and a small set of semantic primitives: `glass-panel`, `glass-card`, `glass-chip`, primary/secondary buttons, page shell, navigation items, and focus states. Theme selection follows the operating system by default and remains manually switchable. A low-contrast CSS particle field provides the technology motif without a canvas dependency. Business/data logic remains in existing Next.js components.

## Consequences

### Positive

- One token source controls light and dark themes across all pages.
- Existing data and playback behavior stay stable.
- CSS particles have negligible bundle and runtime cost.
- Shared primitives reduce page-specific visual drift.

### Negative

- Legacy Tailwind utility colors need gradual neutralization.
- Some semantic error/success colors remain for accessibility.
- The interface still uses the existing component boundaries instead of a full domain rewrite.

### Neutral

- Poster artwork remains the only saturated content.
- Motion is CSS-first and disabled by `prefers-reduced-motion`.

## Alternatives Considered

**Full backend and frontend rewrite**
Rejected because it increases playback and storage regression risk without improving the requested visual outcome.

**Canvas/WebGL particle engine**
Rejected because it adds bundle weight, battery cost, and accessibility complexity for a subtle background effect.

**Keep the existing violet glass theme**
Rejected because it conflicts with the requested Nordic black-and-white direction.
