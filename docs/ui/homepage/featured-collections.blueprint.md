# FeaturedCollections — Section Blueprint

## Purpose

Drives collection discovery immediately after the hero. Presents the four primary product collections as visually prominent cards so customers can navigate directly to what they need.

## Content Requirements

Four collections passed as an array:

| Field | Type | Example |
|-------|------|---------|
| `id` | `string` | `"c1"` |
| `title` | `string` | `"Living Room"` |
| `image.src` | `string` | Placeholder or CDN URL |
| `image.alt` | `string` | `"Living room collection"` |
| `href` | `string` | `"/collections/living-room"` |

Default collections: Living Room, Bedroom, Lighting, Decor Objects.

## Props/Data Contract

```ts
export interface FeaturedCollection {
  id: string
  title: string
  image: { src: string; alt: string }
  href: string
}

interface FeaturedCollectionsProps {
  collections: FeaturedCollection[]
}
```

## Visual Design

- Section header: "Shop by Collection" with subtitle
- 4-column grid on desktop, 2-column on mobile
- Each card: `CollectionCard` (portrait aspect 3:4, title overlaid bottom)
- Background: `canvas` to create soft contrast with hero

## Responsive Behaviour

| Breakpoint | Columns |
|-----------|---------|
| Mobile | 2 |
| Desktop (md+) | 4 |

Cards maintain aspect ratio at all breakpoints. No horizontal scroll.

## Accessibility Requirements

- `<section aria-label="Featured collections">`
- `CollectionCard` provides `aria-label="Shop {title} collection"` on the link
- Each image has descriptive `alt` text

## Allowed Components

- `CollectionCard` from `packages/ui`
- `SectionHeader` from `packages/ui`

## Forbidden Behaviour

- No `"use client"`
- No data fetching — receives `collections` prop from page
- No "View all" link in this section (that belongs in the header nav)
- Do not render more or fewer than the passed array length

## Acceptance Criteria

- [ ] Renders all four collection cards in correct order
- [ ] Grid is 2-col on mobile, 4-col on desktop
- [ ] Each card links to its href
- [ ] Section header visible with title and subtitle
- [ ] Component < 150 lines, TypeScript strict
