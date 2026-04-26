# TASK-0004: Architect Confirmation of Specification Understanding

This document serves as the formal confirmation required by TASK-0004 (P1-S1) to proceed with Phase 1 development.

## 1. Tech Stack Understanding

I confirm full understanding of the locked tech stack for DecorStore (v1.2):

- **Frontend**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4
- **Commerce**: Medusa.js v2 (Headless)
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Search**: Typesense
- **AI**: Claude API + pgvector (for embeddings and recommendations)
- **Media**: Cloudinary
- **Payments**: Stripe (ZAR support, 15% VAT)
- **Deployment**: Vercel (Frontend) + Fly.io (Backend)
- **Toolchain**: pnpm workspaces, TypeScript (strict), ESLint, Prettier, Husky, GitHub Actions

## 2. Hard ORM Boundary Confirmation

I acknowledge and will strictly enforce the hard ORM boundary between Medusa and Prisma:

- **Medusa Ownership**: Authoritative source for Products, Variants, Categories, Carts, Orders, Customers, Inventory, Payments, and Fulfillment.
- **Prisma Ownership**: ONLY custom DecorStore extensions (StyleProfile, RoomMoodBoard, ProductEmbedding, DecorPreference, BlogPost, BlogAuthor, AgentAuditLog, SiteConfig).
- **Restrictions**:
  - No raw SQL queries against Medusa tables from Prisma.
  - No direct database joins between Prisma and Medusa tables.
  - No cross-ORM foreign key constraints (Medusa IDs stored as plain `String` fields in Prisma).
- **Access Paths**: Medusa data is accessed via Store/Admin APIs, Modules, or Services only.
- **Orchestration**: All cross-boundary logic must reside in the **Service Layer** (composition, not database joins).

## 3. Phase 1 Deliverables

The following deliverables will be built during Phase 1 (Project Scaffold):

1. **Authority Files**: (Completed in TASK-0003: `CLAUDE.md`, `docs/*.md`).
2. **Monorepo Structure**: `pnpm-workspace.yaml` with `apps/web`, `apps/api`, `packages/ui`, `packages/db`.
3. **Toolchain**: Strict TypeScript, ESLint, Prettier, and Husky hooks.
4. **Environment**: Comprehensive `.env.example` with all required service slots.
5. **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) for linting, type-checking, and testing.
6. **Prisma Schema**: `packages/db/prisma/schema.prisma` defining custom extensions only, with pgvector enabled.
7. **Prisma Seed**: `packages/db/prisma/seed.ts` for `SiteConfig` and sample `BlogPosts`.
8. **Verified Build**: Successful `pnpm build` across all workspaces with zero errors.

## 4. Architecture Summary

DecorStore follows a headless, monorepo architecture. Next.js 15 handles the storefront and editorial content, while Medusa v2 provides core commerce functionality. Prisma serves as the persistence layer for AI-driven extensions and editorial content. The system is designed for high performance (LCP < 1.8s) and accessibility (WCAG 2.1 AA).

## 5. Service Boundaries & Ownership

- **Commerce (Medusa)**: Transactional integrity, product catalog, order lifecycle.
- **Extensions (Prisma)**: AI metadata, user style profiles, blog content, site-wide configuration.
- **Frontend (Next.js)**: UX orchestration, server-side rendering of composed data.

## 6. Domain Rules

- All commerce data must be validated via Zod at the boundary.
- Eventual consistency is preferred for read models over runtime joins.
- Strict adherence to the 150-line component limit.

## 7. Data and API Implications

- Cross-boundary data retrieval will utilize the Service Layer to fetch from both Medusa and Prisma APIs/Clients.
- Custom Prisma tables will use `medusaProductId` or `medusaCustomerId` (String) as reference keys.

## 8. Agent Handoff Notes

- Backend agents: Ensure Medusa v2 is configured for ZAR and 15% VAT.
- Schema agents: Do not add any commerce entities to `schema.prisma`.
- Frontend agents: Use RSC by default and follow Tailwind v4 design tokens.

---

**Status**: Confirmed & Ready to Proceed.
**Files Changed**: `docs/confirmation.md`
