# StyleQuizCTA — Section Blueprint

## Purpose

AI/personalisation entry point. Converts browsing customers into identified users by offering a low-friction style discovery experience. Positioned after product exposure so the customer has enough context to be motivated.

## Content Requirements

| Field | Type | Example |
|-------|------|---------|
| `title` | `string` | `"Find your style in 60 seconds"` |
| `subtitle` | `string` | `"Answer a few questions and we'll surface the pieces that fit your space and aesthetic."` |
| `cta.label` | `string` | `"Take the quiz"` |
| `cta.href` | `string` | `"/style-quiz"` |

## Props/Data Contract

```ts
interface StyleQuizCtaProps {
  title: string
  subtitle: string
  cta: { label: string; href: string }
}
```

## Visual Design

- Full-width section with `brand` (`#5B7F73`) background — high-contrast break in page rhythm
- Centered layout, generous vertical padding (`py-20 md:py-28`)
- Title: large, `text-canvas` (white on green)
- Subtitle: `text-canvas/75`, `max-w-[48ch]` centred
- CTA: light button (canvas background, brand text) — **do not use standard CTAButton variants**; implement inline Link with explicit light classes
- Two decorative circular border rings (aria-hidden) for geometric texture

## Responsive Behaviour

| Breakpoint | Behaviour |
|-----------|-----------|
| Mobile | All centred, title 2xl |
| Desktop | Title up to 5xl, more padding |

## Accessibility Requirements

- `<section aria-label="Style quiz">`
- Decorative circles: `aria-hidden`
- CTA: `aria-label` matching visible text
- Title and subtitle must pass AA contrast on `#5B7F73` background
  - Canvas (`#F5F5F3`) on brand green passes AA at all sizes

## Allowed Components

- `next/link` for the CTA (implement inline — standard CTAButton variants don't suit a coloured background)
- No UI library components needed

## Forbidden Behaviour

- No `"use client"`
- Do not add quiz logic or state — this is a navigation CTA only
- Do not render this section using the standard `CTAButton` primary/secondary/ghost variants (contrast fails on brand background)
- No background image or pattern beyond the geometric rings

## Acceptance Criteria

- [ ] Section renders with brand green background
- [ ] Title and subtitle centred and legible
- [ ] CTA links to `/style-quiz` with canvas-coloured button
- [ ] Geometric rings are aria-hidden
- [ ] Passes WCAG AA contrast: canvas text on brand green
- [ ] Component < 150 lines, TypeScript strict
