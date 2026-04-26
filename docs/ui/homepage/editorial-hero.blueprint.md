# EditorialHero — Section Blueprint

## Purpose

First impression. Establishes brand tone, communicates the core value proposition, and drives the two primary actions: browse collections or start the style quiz. Occupies near-full viewport height to signal editorial confidence.

## Content Requirements

| Field | Type | Example |
|-------|------|---------|
| `title` | `string` | "Design your space with intention" |
| `subtitle` | `string` | "Handcrafted decor for modern South African homes" |
| `primaryCta.label` | `string` | "Shop Collection" |
| `primaryCta.href` | `string` | "/collections" |
| `secondaryCta.label` | `string` | "Take Style Quiz" |
| `secondaryCta.href` | `string` | "/style-quiz" |

## Props/Data Contract

```ts
interface EditorialHeroProps {
  title: string
  subtitle: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}
```

## Visual Design

- Minimum height: `90svh`
- Background: `canvas` (`#F5F5F3`)
- Geometric accents: subtle right-side block in `brand/8` opacity, circular border ring in `accent/20`, rotated square border in `brand/15`
- Content anchored to bottom-left (editorial magazine convention)
- Title: very large (5xl on mobile, ~88px on desktop), tight leading
- Subtitle: `muted` colour, max 50 characters per line
- CTAs side by side on desktop, stacked on mobile < 360px

## Responsive Behaviour

| Breakpoint | Behaviour |
|-----------|-----------|
| Mobile | Title 3xl, subtitle clamps, CTAs wrap |
| Tablet | Title 4xl, geometric shapes visible |
| Desktop | Title ~88px, full geometric accents |

## Accessibility Requirements

- `<section aria-label="Hero banner">`
- `<h1>` for the title — only `h1` on the page
- Geometric overlay divs marked `aria-hidden`
- Both CTAs use `aria-label` matching button text
- Foreground text must pass AA contrast on canvas background

## Allowed Components

- `CTAButton` from `packages/ui` (primary + secondary variants)
- No other UI library components

## Forbidden Behaviour

- No `"use client"` — this is a Server Component
- No image fetching or `next/image` calls
- No animation libraries
- No carousel or autoplay
- No logo or navigation — those belong in layout

## Acceptance Criteria

- [ ] Renders title, subtitle, and both CTAs
- [ ] Geometric overlays are decorative (aria-hidden) and do not obscure text
- [ ] CTAs link to correct hrefs
- [ ] Component is < 150 lines
- [ ] TypeScript strict — no `any`
- [ ] Passes `tsc --noEmit`
