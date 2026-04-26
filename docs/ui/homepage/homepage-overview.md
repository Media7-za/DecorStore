# Homepage Overview — Hybrid Curated Store

## Purpose

The homepage is the primary entry point for first-time visitors and returning customers. It establishes brand trust, guides collection exploration, and communicates the store's editorial identity — calm, premium, design-conscious — within the first viewport.

## Section Order

| # | Section | Component file |
|---|---------|---------------|
| 1 | EditorialHero | `components/home/EditorialHero.tsx` |
| 2 | FeaturedCollections | `components/home/FeaturedCollections.tsx` |
| 3 | ShopByRoom | `components/home/ShopByRoom.tsx` |
| 4 | CuratedProducts | `components/home/CuratedProducts.tsx` |
| 5 | MakerStory | `components/home/MakerStory.tsx` |
| 6 | StyleQuizCTA | `components/home/StyleQuizCta.tsx` |
| 7 | JournalPreview | `components/home/JournalPreview.tsx` |
| 8 | TrustStrip | `components/home/TrustStrip.tsx` |

## Guiding Principles

- **Editorial first** — every section feels considered, not templated
- **Whitespace is structure** — generous spacing signals premium quality
- **Mobile parity** — mobile is the primary experience, not a cut-down version
- **Prop-driven** — all sections receive data as typed props from the page file; no component fetches data independently

## Page File Rules

- Route: `apps/web/app/(store)/page.tsx`
- Must be a React Server Component (no `"use client"`)
- Declares all typed mock data at the top of the file
- Assembles sections in blueprint order
- No business logic, no calculations, no conditionals beyond data shape

## Shared Layout Constraint

Each section component is responsible for its own vertical padding and horizontal container. Use:

```
py-12 md:py-20
max-w-[1280px] mx-auto px-6
```

Never nest containers or break the max-width rhythm.
