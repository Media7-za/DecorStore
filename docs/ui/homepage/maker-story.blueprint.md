# MakerStory — Section Blueprint

## Purpose

Builds brand trust and differentiation by humanising the supply chain. Signals that this is not a generic dropship store — there are real makers behind the products. Anchors the brand's South African craft identity.

## Content Requirements

| Field | Type | Example |
|-------|------|---------|
| `overline` | `string` | `"The Makers"` |
| `title` | `string` | `"Every piece tells a story of craft"` |
| `body` | `string` | 2–3 sentence brand narrative |
| `cta.label` | `string` | `"Meet the makers"` |
| `cta.href` | `string` | `"/makers"` |
| `image.src` | `string` | Placeholder |
| `image.alt` | `string` | `"Artisan hands shaping a ceramic vessel"` |

## Props/Data Contract

```ts
interface MakerStoryProps {
  overline: string
  title: string
  body: string
  cta: { label: string; href: string }
  image: { src: string; alt: string }
}
```

## Visual Design

- Two-column layout on desktop: text left, image right
- Single column on mobile: text first, image below
- Overline: `text-xs font-semibold tracking-widest uppercase text-accent`
- Title: large editorial heading, `text-ink`
- Body: `text-muted`, max ~52ch line length
- CTA: `CTAButton` with `ghost` variant
- Image: portrait aspect 4:5, fills column, no border or shadow

## Responsive Behaviour

| Breakpoint | Layout |
|-----------|--------|
| Mobile | Single column, text → image |
| Desktop (md+) | 2-column grid, text | image |

Image column takes half the grid. Text column has `max-w-[52ch]` on body copy.

## Accessibility Requirements

- `<section aria-label="Our makers">`
- Image container: `role="img" aria-label={image.alt}` (if using div bg-image)
- Overline not a heading — use `<p>` or `<span>`
- Title is `<h2>`
- CTA has visible text label

## Allowed Components

- `CTAButton` from `packages/ui` (ghost variant)

## Forbidden Behaviour

- No `"use client"`
- No video, animation, or parallax
- No maker data fetching — static narrative copy only
- Do not add social proof metrics (e.g. "200+ makers") — not approved for Phase 2

## Acceptance Criteria

- [ ] Overline, title, body, and CTA render correctly
- [ ] Two-column layout on desktop, single on mobile
- [ ] Image occupies right column on desktop
- [ ] `ghost` variant CTA links to `/makers`
- [ ] Component < 150 lines, TypeScript strict
