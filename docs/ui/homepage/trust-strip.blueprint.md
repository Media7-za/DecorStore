# TrustStrip — Section Blueprint

## Purpose

Closes the homepage by resolving purchase anxiety. Concisely communicates the four core purchase guarantees: free delivery, secure checkout, local craftsmanship, easy returns. Positioned just before the footer.

## Content Requirements

Four static trust items — hardcoded in the component (not props-driven):

| Icon | Label | Description |
|------|-------|-------------|
| Arrow | Free Delivery | On orders over R800 |
| Checkmark | Secure Checkout | SSL encrypted payments |
| Star | Local Craftsmanship | Made in South Africa |
| Refresh | Easy Returns | 30-day return policy |

These are brand commitments, not dynamic data. No props required.

## Props/Data Contract

```ts
// No props — content is static brand copy
export function TrustStrip(): JSX.Element
```

## Visual Design

- Thin top border (`border-t border-ink/8`) separates from JournalPreview
- Light vertical padding (`py-10`)
- 4-column grid on desktop, 2-column on mobile
- Each item: centred, icon (large, `text-brand`) → label (`text-sm font-semibold text-ink`) → description (`text-xs text-muted`)
- No cards or borders on individual items — clean list

## Responsive Behaviour

| Breakpoint | Columns |
|-----------|---------|
| Mobile | 2 |
| Desktop (md+) | 4 |

## Accessibility Requirements

- `<section aria-label="Trust indicators">`
- Items rendered as `<ul>` with `<li>` — list structure communicates the group
- Icon characters are `aria-hidden` (decorative symbol)
- Label and description provide the meaningful content

## Allowed Components

- No UI library components needed — plain HTML + Tailwind

## Forbidden Behaviour

- No `"use client"`
- Do not make trust items data-driven or configurable via props in Phase 2
- No external icon library — use plain text symbols for placeholders
- No links — these are information items, not navigation

## Acceptance Criteria

- [ ] Four trust items render in correct order
- [ ] 2-col mobile, 4-col desktop
- [ ] Top border separates section from journal
- [ ] Icons are aria-hidden
- [ ] Component < 80 lines, TypeScript strict
