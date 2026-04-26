# DecorStore

Hybrid Curated Store — handcrafted decor for modern South African homes.

## Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | Next.js 15, App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Library | `packages/ui` |
| Commerce | Medusa (Phase 3+) |

## Rules

### TypeScript
- Strict mode on, no `any`
- Explicit return types on all exported functions
- Interfaces for all prop types

### React / Next.js
- React Server Components by default
- `"use client"` only when interaction requires it (forms, state, browser APIs)
- No component > 150 lines
- No data fetching inside UI components — all data passed as props

### Tailwind CSS v4
- Tokens defined in `apps/web/app/globals.css` via `@theme`
- Mobile-first responsive classes
- No inline styles

### Components
- All shared components live in `packages/ui/src/`
- All page-specific section components live in `apps/web/components/`
- Only build components listed in `docs/design/component-inventory.json`
- All images require descriptive `alt` text
- All interactive elements require visible label or `aria-label`

### Code Style
- Named exports only — no default exports from components
- No comments unless the WHY is non-obvious
- No `// TODO`, `// FIXME`, or `// HACK` left in committed code

## Project Structure

```
apps/
  web/
    app/
      (store)/page.tsx      ← homepage (Phase 2)
      globals.css           ← Tailwind v4 @theme tokens
      layout.tsx
    components/
      home/                 ← homepage section components
packages/
  ui/
    src/                    ← shared component library
docs/
  design/                   ← JSON design artifacts
  ui/
    homepage/               ← section-level blueprints
scripts/                    ← AgentPM CLI
.agentpm/                   ← AgentPM ledger
```

## Phase 2 Boundaries

- No backend logic in any UI component
- No real data fetching — typed mock data in page files only
- No new npm packages without explicit approval
- No pages beyond homepage
- No components outside the approved inventory

## Design Contracts

Read before touching UI:

| File | Purpose |
|---|---|
| `docs/design/visual-direction.json` | Brand colours, typography, tone |
| `docs/design/layout-system.json` | Grid, breakpoints, spacing |
| `docs/design/component-inventory.json` | Approved component set and prop contracts |
| `docs/design/homepage-blueprint.json` | Section order and content spec |
