# DecorStore Agentic Build Specification

**Version**: 1.2
**Source**: DecorStore_AgenticBuildSpec_v1.2.docx

---

**DECORSTORE**

Interior Decor E-Commerce

**Agentic Build Spec**

**v1.2**

_CLI AI Agents · Claude Code · MCP Orchestration_

2026

| Document | DecorStore Agentic Build Spec v1.2    |
| -------- | ------------------------------------- |
| Version  | 1.2 — Service Layer + Agent Hardening |
| Date     | April 2026                            |
| Stack    | Next.js 15 · Medusa v2 · Claude Code  |
| Status   | APPROVED — Phase 1 Ready              |

# **1. Product Vision**

DecorStore is an editorial-first, AI-augmented interior decor e-commerce store targeting design-conscious homeowners across South Africa. The store is built entirely by CLI AI agents orchestrated through Claude Code, with each phase of development executed autonomously against this specification.

**Mission**

Deliver a world-class shopping experience for handcrafted, locally sourced decor objects — where brand storytelling, intelligent product discovery, and frictionless checkout coexist.

**Core value propositions**

Slow design philosophy: every product page tells the maker's story before it sells the object

AI-powered style matching: customers find pieces that fit their existing space, not just their keyword

Seamless checkout: 2-step flow, no account required, Stripe-native, VAT-inclusive pricing

Editorial content: a curated journal positions the brand as a design authority, not a marketplace

**Success metrics — 90 days post-launch**

| Metric                | Target              |
| --------------------- | ------------------- |
| Page load (LCP)       | < 1.8 s on 4G       |
| Checkout conversion   | > 3.2 %             |
| AI recommendation CTR | > 18 %              |
| Core Web Vitals       | All green (Vercel)  |
| Accessibility         | WCAG 2.1 AA         |
| Lighthouse score      | > 95 all categories |

# **2. Locked Tech Stack**

The following stack is non-negotiable. Claude Code must not introduce unlisted dependencies without explicit written approval. Any deviation blocks the phase gate.

| Layer       | Technology                 | Rationale                                             |
| ----------- | -------------------------- | ----------------------------------------------------- |
| CLI Agent   | Claude Code                | Full codebase awareness, MCP-native, bash execution   |
| Frontend    | Next.js 15 + React 19      | App Router, RSC, streaming SSR, Vercel-native         |
| Styling     | Tailwind CSS v4            | Design token system, agent-friendly class names       |
| Commerce    | Medusa.js v2               | Open-source, headless, plugin-extensible              |
| Database    | PostgreSQL (Neon) + Prisma | Readable schema, type-safe queries, vector support    |
| Payments    | Stripe                     | Checkout, webhooks, ZAR support, Medusa plugin        |
| AI / Reco   | Claude API + pgvector      | Style quiz, chatbot, semantic product search          |
| Media       | Cloudinary                 | AI transforms, WebP, background removal               |
| Search      | Typesense                  | Self-hosted, faceted, instant, agent-seedable         |
| Email       | Resend + React Email       | Transactional, branded templates, agent-generated     |
| Deploy      | Vercel + Fly.io            | Edge frontend + persistent Medusa API compute         |
| Monitoring  | PostHog + Sentry           | Analytics, funnels, error tracking, Sentry MCP repair |
| Pkg manager | pnpm + workspaces          | Monorepo: /apps/web, /apps/api, /packages/ui          |
| Language    | TypeScript (strict mode)   | No any types. No JS files.                            |

# **3. Commerce Domain Model**

This project uses two distinct data layers with a hard boundary between them. Medusa v2 is the authoritative owner of all commerce entities. Prisma models only custom DecorStore extensions that Medusa has no concept of. These two layers must never be conflated.

| Critical architecture decision: ORM boundary<br>Medusa is the source of truth for all commerce entities. Prisma may only model custom DecorStore extensions such as AI recommendations, room profiles, content metadata, embeddings, and agent audit logs. Do not recreate, migrate, foreign-key, raw-query, or directly mutate Medusa-owned commerce tables from Prisma. Access Medusa commerce data only through Medusa APIs, modules, services, or approved extension points. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**Medusa owns — commerce domain (do not recreate in Prisma)**

| Medusa entity                     | Accessed via                          |
| --------------------------------- | ------------------------------------- |
| Product, ProductVariant, Category | Medusa Store API / Admin API          |
| Cart, LineItem                    | Medusa Store API cart routes          |
| Order, OrderItem                  | Medusa Admin API / order service      |
| Customer, Address                 | Medusa Store API customer routes      |
| Inventory, StockLocation          | Medusa inventory module               |
| Payment, PaymentSession           | Medusa Stripe plugin / payment module |
| Fulfillment, Shipment             | Medusa fulfillment module             |
| Region, ShippingOption            | Medusa Admin API                      |

**Prisma owns — custom DecorStore extensions only**

| Custom Prisma entity | Key fields                                                                        |
| -------------------- | --------------------------------------------------------------------------------- |
| StyleProfile         | id, medusaCustomerId (string), quizAnswers (JSON), recommendedStyles[], createdAt |
| RoomMoodBoard        | id, medusaCustomerId (string), name, productIds (string[]), imageUrl, createdAt   |
| ProductEmbedding     | id, medusaProductId (string), vector (pgvector), model, updatedAt                 |
| DecorPreference      | id, medusaCustomerId (string), styleWeights (JSON), updatedAt                     |
| BlogPost             | id, title, slug, body, featuredImage, seoTitle, seoDescription, publishedAt       |
| BlogAuthor           | id, name, bio, avatarUrl                                                          |
| AgentAuditLog        | id, phase, command, status, errorMessage, durationMs, createdAt                   |
| SiteConfig           | id, key, value — VAT rate, shipping thresholds, feature flags                     |

**Cross-boundary access rules**

Medusa commerce IDs are stored in Prisma as plain string fields only — never as foreign keys with DB constraints

Referential integrity across the Medusa/Prisma boundary is enforced in service logic, not database constraints

No Prisma table may join against, raw-query, or create a foreign key to any Medusa-owned table

Custom Prisma tables reference Medusa entities by ID (e.g. medusaProductId: String) and resolve the full object via Medusa API at runtime

**Service layer rule — where cross-boundary logic lives**

Data from Medusa and Prisma must never be combined directly in frontend components or API routes. All orchestration across the boundary lives exclusively in a service layer under apps/api/src/services/ or apps/web/src/lib/services/.

| Cross-boundary orchestration pattern<br>CORRECT — service layer orchestrates both sources:<br> async getProductWithRecommendations(medusaProductId: string) {<br> const product = await medusaClient.products.retrieve(id); // Medusa API<br> const embedding = await prisma.productEmbedding.findUnique({ where: { medusaProductId } });<br> return { product, embedding }; // composed in service, not in component<br> }<br>FORBIDDEN — mixing sources in a route handler or component directly:<br> const product = await medusa.getProduct(); // Medusa<br> const embedding = await prisma.productEmbedding.find(); // Prisma<br> return { ...product, embedding }; // spaghetti — agent must not do this |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**Read model pattern — for frequently joined data**

If a feature requires combining Medusa and Prisma data on every request (product detail page, AI recommendations, room builder), create a derived read model rather than querying both sources at runtime on each call.

A read model is a denormalised cache table in Prisma, or a lightweight API layer that pre-composes the data

Read models are updated by Medusa subscribers or scheduled jobs when the source data changes

Examples requiring a read model: PDP with embeddings, 'Complete the room' shelf, semantic search results

Read model staleness is acceptable — eventual consistency is preferred over runtime cross-source joins

# **4. Agent Authority Rules**

Claude Code operates with bounded autonomy. The following rules are injected via CLAUDE.md and enforced on every agent run. Violations must halt the task and surface to the human operator.

**Always**

Read CLAUDE.md and /docs/commerce-boundaries.md in full before starting any task

Write TypeScript — never .js files

Use React Server Components by default; add 'use client' only when strictly necessary

Write a unit or integration test alongside every new utility function

Keep components under 150 lines; extract sub-components if longer

Create a feature branch and commit with conventional commit messages after each subtask

Run pnpm build and fix all errors before marking a phase complete

Use zod for all external data validation (API responses, form inputs, env vars)

Add ARIA labels and alt text to every interactive element and image

Access Medusa commerce data through Medusa Store API, Admin API, modules, or services only

**Never**

Add npm packages not listed in the approved stack

Hardcode API keys, secrets, or environment-specific URLs

Push commits directly to main — always open a PR

Use the any TypeScript type

Write inline SQL — all Prisma queries go through the Prisma client; all Medusa queries go through Medusa APIs

Modify .env files — create .env.example entries only

Delete or overwrite CLAUDE.md or any file in /docs/

Skip the QA gate at the end of a phase

Recreate Medusa-owned entities (products, variants, orders, carts, customers, inventory, payments, fulfillment) in Prisma

Query, mutate, join against, or create foreign keys to Medusa-owned database tables directly from Prisma

Create cross-ORM foreign keys — Medusa IDs must be stored as plain strings in Prisma, never as relational constraints

| Approved Medusa access paths<br>Agents may query or extend Medusa commerce entities through:<br> Medusa Store API (http://localhost:9000/store/...)<br> Medusa Admin API (http://localhost:9000/admin/...)<br> Medusa modules/services (injected via DI container)<br> Approved Medusa extension points (subscribers, workflows)<br>Agents may not recreate Medusa-owned entities in Prisma unless a written architecture decision document in /docs/ explicitly approves it. |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**Escalate to human operator when**

A required API key is missing from the environment

A build error cannot be resolved after 3 automated attempts

A dependency version conflict requires stack deviation

Any task would require accessing Medusa database tables directly rather than through the approved API paths

A feature requires cross-boundary data orchestration — escalate so service layer architecture can be confirmed before coding begins

| Medusa extension strategy — locked<br>All Medusa extensions must use one of these approved patterns only:<br> Modules — add custom commerce logic via Medusa module system<br> Workflows — orchestrate multi-step commerce operations<br> Subscribers — react to Medusa events without modifying core<br>Do not patch, monkey-patch, or override Medusa core internals. If an extension cannot be achieved through modules, workflows, or subscribers, escalate to the human operator before proceeding. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

| MCP idempotency rule — all external actions must be safe to retry<br>Agents interacting with external systems via MCP must treat all actions as potentially repeated. Before creating any external resource, check for existence first.<br> Stripe — check for existing product/price before calling products.create<br> Migrations — check migration history before running prisma migrate deploy<br> Vercel — check project existence before calling project.create<br> Typesense — check collection existence before creating schema<br>Duplicate Stripe products/prices, orphaned migrations, and double-deployed infra are agent-caused incidents. The existence check is mandatory, not optional. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

# **5. MCP Permissions Matrix**

Claude Code connects to the following MCP servers. Each server has a defined permission scope. The agent must not invoke tools outside its granted scope for the current phase.

| MCP Server  | Phase active  | Permission   | Allowed actions                                                             |
| ----------- | ------------- | ------------ | --------------------------------------------------------------------------- |
| GitHub MCP  | All phases    | Read + Write | Create branches, commits, PRs, read CI status, tag releases                 |
| Vercel MCP  | Phase 1, 6    | Deploy only  | Trigger deploys, set env vars, read build logs, manage domains              |
| Stripe MCP  | Phase 3, 6    | Config only  | Create products/prices, configure webhooks, test checkout — no live charges |
| DB / Prisma | Phase 1, 3, 5 | Read + Write | Run migrations, seed data, query schema, optimise slow queries              |
| Sentry MCP  | Phase 6+      | Read + Patch | Fetch error traces, auto-patch bugs, close resolved issues                  |
| Cloudinary  | Phase 5       | Upload only  | Upload product images, apply transforms, generate srcsets                   |
| Typesense   | Phase 3, 5    | Read + Write | Create collections, index products, configure ranking rules                 |

_Permission levels: Read + Write grants full CRUD. Config only restricts to non-transactional setup. Deploy only prevents config changes. Upload only prevents reads of sensitive data._

# **6. Six-Phase Build Pipeline**

Each phase is a discrete Claude Code session. The agent must complete all required artifacts and pass the phase gate before the next phase begins.

| #   | Phase            | Primary agent            | Deliverables                                                                          |
| --- | ---------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| 1   | Project scaffold | Claude Code              | Authority docs, monorepo, toolchain, env, CI/CD, custom Prisma schema, verified build |
| 2   | Storefront UI    | Claude Code              | All pages, component library, Tailwind tokens, responsive layouts                     |
| 3   | Backend & APIs   | Claude Code + MCP        | Medusa config, Stripe, Typesense index, shipping rules, webhooks                      |
| 4   | AI features      | Claude Code + Claude API | Style quiz, recommendations, chatbot, pgvector embeddings                             |
| 5   | Content & SEO    | Claude Code              | Product copy, meta tags, schema markup, blog posts, alt text                          |
| 6   | Deploy & monitor | Claude Code + MCP        | Vercel + Fly.io deploy, domain, Sentry, PostHog, smoke tests                          |

**Phase sequencing rules**

Phases execute strictly in order — no parallel phases

Each phase begins with: claude read CLAUDE.md && claude read BUILD_SPEC.md

Each phase ends with the operator running the QA gate checklist in Section 8

CLAUDE.md phase field is updated to the completed phase number before the next session

# **7. Required Artifacts Per Phase**

## **Phase 1 — Scaffold**

_Phase 1 produces contracts first, code second. Step 0 authority files must exist and be reviewed before any code is written._

**Step 0 — Authority files (created before monorepo init)**

CLAUDE.md — brand, stack, persona, agent rules, current phase

/docs/architecture.md — system overview, component map, data flow

/docs/domain-model.md — full entity list with owner (Medusa vs Prisma) and access path

/docs/commerce-boundaries.md — ORM boundary rules, approved Medusa access paths, forbidden patterns

/docs/agent-rules.md — always/never/escalate rules verbatim from Section 4 of this spec

/docs/mcp-permissions.md — MCP server list, phase activation, permission scopes from Section 5

/docs/phase-1-exit-criteria.md — checklist of all Phase 1 artifacts and QA gates

**Step 1–8 — Code artifacts**

pnpm-workspace.yaml with /apps/web, /apps/api, /packages/ui

.env.example with all service credential slots

tsconfig.json (strict mode, path aliases)

.eslintrc.json and .prettierrc

.husky/ with pre-commit lint + type-check hooks

.github/workflows/ci.yml — lint, type-check, test, Vercel preview deploy

packages/db/prisma/schema.prisma — custom extensions only: StyleProfile, RoomMoodBoard, ProductEmbedding, DecorPreference, BlogPost, BlogAuthor, AgentAuditLog, SiteConfig

packages/db/prisma/seed.ts — seed SiteConfig (VAT 0.15, free shipping threshold R2500) and sample BlogPosts only. Do not seed products — Medusa owns product data

pnpm build — zero errors, zero type errors

| Phase 1 hard stop — all four conditions must be true before Phase 2 begins<br>Phase 1 is COMPLETE only when ALL of the following pass. Partial completion does not qualify.<br> [ ] Medusa server boots successfully — curl http://localhost:9000/health returns 200<br> [ ] Prisma migration runs cleanly — prisma migrate deploy exits 0, no pending migrations<br> [ ] pnpm build passes across all workspaces — zero TypeScript errors, zero compile errors<br> [ ] CI pipeline runs green — GitHub Actions lint, tsc, test all pass on the Phase 1 PR<br>If any condition fails: the agent must fix the failure and re-verify all four before marking Phase 1 done. The operator must manually tick each box in /docs/phase-1-exit-criteria.md before the Phase 1 PR is merged. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

## **Phase 2 — Storefront UI**

packages/ui — Button, Card, Badge, Input, Select, Modal, Toast components

apps/web/app/(store)/page.tsx — homepage with hero, featured collections

apps/web/app/(store)/products/page.tsx — listing with Typesense InstantSearch

apps/web/app/(store)/products/[slug]/page.tsx — PDP with gallery + variant picker

apps/web/app/(store)/cart/page.tsx — cart with line item management

apps/web/app/(store)/checkout/page.tsx — 2-step checkout flow

apps/web/app/(store)/quiz/page.tsx — style quiz UI (5 questions)

apps/web/app/(journal)/[slug]/page.tsx — blog post template

Tailwind config with brand tokens (colours, fonts, spacing)

Fully responsive at 320 px, 768 px, 1280 px, 1920 px breakpoints

## **Phase 3 — Backend & APIs**

apps/api — Medusa v2 server with all product, order, customer routes

Stripe plugin configured with ZAR currency and 15 % VAT

Webhook handler for payment_intent.succeeded, order.fulfillment.created

Typesense collection schema and product indexing job

Shipping rate calculator (free >= R2 500, flat R120 otherwise)

apps/api/src/jobs/ — nightly inventory sync, search re-index

End-to-end checkout test: add to cart → payment → order record created

## **Phase 4 — AI Features**

apps/web/app/api/quiz/route.ts — quiz → Claude API → product recommendations

apps/web/app/api/chat/route.ts — streaming decor advisor chatbot

apps/web/app/api/search/semantic/route.ts — pgvector similarity search

apps/web/components/ChatWidget.tsx — floating chatbot UI

scripts/embed-products.ts — generate and store embeddings for all products

Cross-sell logic: 'Complete the room' shelf on PDP

## **Phase 5 — Content & SEO**

AI-generated product descriptions for all seeded products (Claude API)

generateMetadata() on all pages — title, description, OG image

JSON-LD structured data: Product, BreadcrumbList, Organization

sitemap.xml and robots.txt

3 editorial blog posts (800–1200 words each)

All images have descriptive alt text

apps/web/app/api/og/route.ts — dynamic OG image generation

## **Phase 6 — Deploy & Monitor**

Vercel project linked, production domain configured

Fly.io app created, Medusa API deployed with health check

All production env vars set in Vercel and Fly.io dashboards

Sentry DSN configured, source maps uploaded

PostHog project created, pageview and checkout funnel events wired

Smoke test suite passing against production URL

Lighthouse CI report: all scores > 95

# **8. QA / Deployment Gates**

Each gate must be passed before the next phase starts. The operator runs the gate — not the agent. Gate failures block the pipeline.

| Gate | Check         | Pass criteria                          | Tool                                 |
| ---- | ------------- | -------------------------------------- | ------------------------------------ |
| G1   | Build health  | pnpm build exits 0, no TS errors       | CI + tsc --noEmit                    |
| G2   | Lint & format | 0 ESLint errors, Prettier passes       | eslint + prettier --check            |
| G3   | Unit tests    | 100 % of written tests pass            | pnpm test                            |
| G4   | Accessibility | 0 WCAG 2.1 AA violations               | axe-core / Lighthouse a11y           |
| G5   | Performance   | LCP < 1.8 s, CLS < 0.1, FID < 100 ms   | Lighthouse CI                        |
| G6   | E2E checkout  | Cart → payment → order in DB in < 8 s  | Playwright smoke test                |
| G7   | SEO audit     | All pages have meta, OG, JSON-LD       | Screaming Frog / Lighthouse SEO      |
| G8   | Security      | No secrets in git, HTTPS only, CSP set | git-secrets + Security headers check |

_Gates G1–G3 run on every PR via GitHub Actions. Gates G4–G8 are run manually by the operator at the end of each phase before approving the phase branch merge._

# **9. First Claude Code Command Set**

The following commands bootstrap Phase 1 from a clean directory. Run them in sequence. Each command is a single Claude Code invocation. Authority files come before any code.

**Prerequisites (operator runs once)**

Install Claude Code: npm install -g @anthropic-ai/claude-code

Authenticate: claude auth login

Create repo: gh repo create decorstore --private && git clone <url> && cd decorstore

**Phase 1 command sequence**

**Command 0 — Create authority files (run before any code)**

$ claude "Create the following authority files exactly as specified in BUILD_SPEC.md Section 7 Step 0: CLAUDE.md, /docs/architecture.md, /docs/domain-model.md, /docs/commerce-boundaries.md, /docs/agent-rules.md, /docs/mcp-permissions.md, /docs/phase-1-exit-criteria.md. Populate each file with the content that matches its purpose and this spec. Do not create any other files yet."

**Command 1 — Brief confirmation**

$ claude "Read CLAUDE.md, /docs/commerce-boundaries.md, and BUILD_SPEC.md. Confirm you understand: (1) the stack, (2) that Medusa owns commerce entities and Prisma owns only custom extensions, (3) the Phase 1 deliverables. List what you will create next."

**Command 2 — Initialise monorepo**

$ claude "Initialise a pnpm monorepo with workspaces: apps/web (Next.js 15), apps/api (Medusa v2), packages/ui (shared components), packages/db (Prisma custom schema). Configure pnpm-workspace.yaml."

**Command 3 — Toolchain**

$ claude "Add strict TypeScript config with path aliases, ESLint with Next.js rules, Prettier, and Husky pre-commit hooks that run lint and tsc."

**Command 4 — Environment**

$ claude "Create .env.example with slots for: DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, TYPESENSE_HOST, TYPESENSE_API_KEY, RESEND_API_KEY, ANTHROPIC_API_KEY, MEDUSA_JWT_SECRET, NEXT_PUBLIC_MEDUSA_URL."

**Command 5 — CI/CD pipeline**

$ claude "Write a GitHub Actions workflow at .github/workflows/ci.yml that runs on every PR: pnpm install, lint, tsc --noEmit, pnpm test, then triggers a Vercel preview deployment."

**Command 6 — Custom Prisma schema (extensions only)**

$ claude "Write packages/db/prisma/schema.prisma for custom DecorStore extensions ONLY: StyleProfile, RoomMoodBoard, ProductEmbedding (pgvector), DecorPreference, BlogPost, BlogAuthor, AgentAuditLog, SiteConfig. Do NOT create Product, Variant, Order, Cart, Customer, Address, Inventory, Payment, or Fulfillment tables — these are owned by Medusa. All references to Medusa entities must be plain String ID fields with no foreign key constraints. Enable pgvector extension. Generate the initial migration."

**Command 7 — Seed config data only**

$ claude "Write packages/db/prisma/seed.ts that seeds SiteConfig rows only: vatRate=0.15, freeShippingThreshold=2500, stockLowThreshold=3. Add 2 sample BlogPost rows for testing. Do NOT seed products, variants, orders, or customers — those are seeded through Medusa."

**Command 8 — Verify & commit**

$ claude "Run pnpm build across all workspaces. Fix any TypeScript or build errors. Once the build is clean, commit everything to branch feat/phase-1-scaffold with message 'feat: phase 1 scaffold complete'. Open a PR to main."

**Quick-fire commands for later phases**

| Phase           | Trigger command                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 UI      | claude "Begin Phase 2. Read CLAUDE.md and /docs/commerce-boundaries.md first. Build all storefront pages and packages/ui per BUILD_SPEC.md Section 7."                                                     |
| Phase 3 Backend | claude "Begin Phase 3. Read /docs/commerce-boundaries.md first. Configure Medusa v2, wire Stripe and Typesense, implement shipping logic and webhooks. Access all commerce data through Medusa APIs only." |
| Phase 4 AI      | claude "Begin Phase 4. Implement the style quiz, recommendation engine, chatbot, and pgvector semantic search. Store results in custom Prisma tables. Fetch product data from Medusa Store API."           |
| Phase 5 Content | claude "Begin Phase 5. Write SEO copy for all products, generate metadata, structured data, sitemap, and 3 blog posts. Store blog content in Prisma BlogPost table."                                       |
| Phase 6 Deploy  | claude "Begin Phase 6. Deploy to Vercel and Fly.io, configure domain, wire Sentry and PostHog, run smoke tests."                                                                                           |

_DecorStore — Agentic Build Spec v1.2_

**Approved for Phase 1 execution — Service layer + agent hardening enforced**
