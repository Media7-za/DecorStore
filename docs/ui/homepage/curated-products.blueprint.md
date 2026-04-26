# CuratedProducts — Section Blueprint

## Purpose

Surfaces a hand-selected set of products to give first-time visitors an immediate sense of the product quality and price range. Not a full catalogue — a curated moment of discovery. Label reinforces editorial authority.

## Content Requirements

| Field | Type | Example |
|-------|------|---------|
| `label` | `string` | `"Selected for your space"` |
| `products[].id` | `string` | `"p1"` |
| `products[].title` | `string` | `"Woven Rattan Pendant"` |
| `products[].price` | `string` | `"R 1 250"` |
| `products[].image.src` | `string` | Placeholder |
| `products[].image.alt` | `string` | `"Woven rattan pendant light"` |

Render exactly 4 products. Prices are display strings (formatted, localised), not numbers.

## Props/Data Contract

```ts
export interface CuratedProduct {
  id: string
  title: string
  price: string
  image: { src: string; alt: string }
}

interface CuratedProductsProps {
  label: string
  products: CuratedProduct[]
}
```

## Visual Design

- Section background: `canvas` (creates alternating rhythm with white sections)
- Section header uses `label` as title, with editorial subtitle
- 4-column grid on desktop, 2-column on mobile
- Each card: `ProductCard` (square image, title below, price below title)
- No price badge, no "add to cart" — display only in Phase 2

## Responsive Behaviour

| Breakpoint | Columns |
|-----------|---------|
| Mobile | 2 |
| Desktop (md+) | 4 |

## Accessibility Requirements

- `<section aria-label={label}>`
- Each `ProductCard` is an `<article>`
- All images have descriptive alt text
- Price text is plain copy — no `aria-label` override needed

## Allowed Components

- `ProductCard` from `packages/ui`
- `SectionHeader` from `packages/ui`

## Forbidden Behaviour

- No `"use client"`
- No add-to-cart, wishlist, or any interactive product action
- No price calculations or formatting logic — display string passed as prop
- No filtering, sorting, or pagination

## Acceptance Criteria

- [ ] Renders exactly 4 product cards
- [ ] Section uses `label` prop as heading
- [ ] Products are in 2-col (mobile) / 4-col (desktop) grid
- [ ] No interactive product actions present
- [ ] Component < 150 lines, TypeScript strict
