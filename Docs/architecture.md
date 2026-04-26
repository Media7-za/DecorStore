# System Architecture - DecorStore

## Overview

DecorStore is an editorial-first, AI-augmented e-commerce platform. It uses a headless architecture with a Next.js frontend and a Medusa v2 backend.

## Component Map

The project is structured as a pnpm monorepo:

- **`apps/web`**: Next.js 15 frontend application.
- **`apps/api`**: Medusa v2 headless commerce engine.
- **`packages/ui`**: Shared React component library (Tailwind v4).
- **`packages/db`**: Prisma schema and migrations for custom extensions.

## Data Flow

1. **User Interaction**: Users interact with the Next.js frontend (`apps/web`).
2. **Commerce Logic**: The frontend communicates with `apps/api` (Medusa v2) via the Medusa Store API for all commerce-related operations (products, cart, checkout).
3. **Custom Features**: AI features (style quiz, recommendations) use `packages/db` (Prisma) to store and retrieve custom data not handled by Medusa.
4. **Search**: Product search is powered by Typesense, which is indexed from Medusa data.
5. **AI Integration**: Claude API is used for generating recommendations and content, with embeddings stored in PostgreSQL using `pgvector`.

## Infrastructure

- **Frontend**: Vercel (Edge-ready)
- **Backend**: Fly.io (Persistent compute for Medusa)
- **Database**: PostgreSQL (Neon)
- **Media**: Cloudinary
- **Payments**: Stripe
- **Monitoring**: Sentry & PostHog
