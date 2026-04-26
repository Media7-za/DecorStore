# ShopByRoom — Section Blueprint

## Purpose

Provides a room-based navigation shortcut for customers who think spatially ("I need something for my dining room") rather than by collection type. Complements FeaturedCollections without repeating it.

## Content Requirements

Four rooms passed as an array:

| Field | Type | Example |
|-------|------|---------|
| `id` | `string` | `"r1"` |
| `title` | `string` | `"Lounge"` |
| `image.src` | `string` | Placeholder or CDN URL |
| `image.alt` | `string` | `"Lounge interior"` |
| `href` | `string` | `"/rooms/lounge"` |

Default rooms: Lounge, Bedroom, Dining, Office.

## Props/Data Contract

```ts
export interface Room {
  id: string
  title: string
  image: { src: string; alt: string }
  href: string
}

interface ShopByRoomProps {
  rooms: Room[]
}
```

## Visual Design

- Section header: "Shop by Room" (no subtitle needed)
- 4-column grid on desktop, 2-column on mobile
- Each tile: square aspect ratio (1:1)
- Image covers tile, gradient overlay `from-ink/50` at bottom
- Room name in white, bottom-left, `text-sm font-semibold`
- Hover: image scales to 105%
- No card border or drop shadow — image bleeds to edge

## Responsive Behaviour

| Breakpoint | Columns |
|-----------|---------|
| Mobile | 2 |
| Desktop (md+) | 4 |

## Accessibility Requirements

- `<section aria-label="Shop by room">`
- Each tile: `<Link aria-label="Shop {title}">`
- Image container: `role="img" aria-label={image.alt}` (when using div bg-image)
- Gradient overlay: `aria-hidden`

## Allowed Components

- `SectionHeader` from `packages/ui`
- Native `<Link>` from `next/link` for tiles (CollectionCard uses 3:4 ratio; these are 1:1, so implement inline)

## Forbidden Behaviour

- No `"use client"`
- No hover state managed via JS — CSS only (`group` + `group-hover:scale-105`)
- No carousel — all four tiles visible at once

## Acceptance Criteria

- [ ] Four room tiles render in correct order
- [ ] Square aspect ratio maintained on all screen sizes
- [ ] Hover scale effect works via CSS
- [ ] Room labels legible over gradient overlay
- [ ] Each tile links to correct href
- [ ] Component < 150 lines, TypeScript strict
