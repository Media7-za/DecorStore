# JournalPreview — Section Blueprint

## Purpose

Establishes editorial authority and positions DecorStore as a design resource, not just a shop. Three preview cards give visitors a reason to return. Reinforces the brand's point of view.

## Content Requirements

Three journal posts passed as an array:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Unique key |
| `title` | `string` | Post headline |
| `description` | `string` | 1–2 sentence excerpt |
| `image.src` | `string` | Portrait preferred (4:5) |
| `image.alt` | `string` | Descriptive |
| `href` | `string` | Post route |
| `badge` | `string \| undefined` | Optional category label |

## Props/Data Contract

```ts
export interface JournalPost {
  id: string
  title: string
  description: string
  image: { src: string; alt: string }
  href: string
  badge?: string
}

interface JournalPreviewProps {
  posts: JournalPost[]
}
```

## Visual Design

- Section header row: "From the Journal" title left, "View all" ghost CTA right — flex row, items-end
- 3-column grid on desktop, 1-column stacked on mobile
- Each post: `EditorialCard` (image-first, badge optional, "Read more →" link)
- Section background: white (natural contrast with flanking canvas sections)

## Responsive Behaviour

| Breakpoint | Columns |
|-----------|---------|
| Mobile | 1 (cards full width) |
| Desktop (md+) | 3 |

Header row on mobile: section title above, "View all" below or hidden.

## Accessibility Requirements

- `<section aria-label="Journal">`
- Section header and "View all" are siblings, not nested
- `EditorialCard` CTA uses `aria-label="Read more — {title}"` to disambiguate
- All images have descriptive alt text
- Badge is decorative — `aria-hidden` if redundant with visible label

## Allowed Components

- `EditorialCard` from `packages/ui`
- `SectionHeader` from `packages/ui`
- `CTAButton` from `packages/ui` (ghost variant for "View all")

## Forbidden Behaviour

- No `"use client"`
- No post fetching — receives `posts` prop from page
- Do not render more or fewer than passed post count (Phase 2 always 3)
- No infinite scroll, pagination, or filtering

## Acceptance Criteria

- [ ] Three editorial cards rendered in correct order
- [ ] Header row: title left, "View all" right on desktop
- [ ] "View all" links to `/journal`
- [ ] Each card links to its `href`
- [ ] Badge renders when provided, absent when not
- [ ] 1-col mobile, 3-col desktop
- [ ] Component < 150 lines, TypeScript strict
