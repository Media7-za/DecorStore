# DecorStore Authority (CLAUDE.md)

## Project Vision

A luxury interior decor e-commerce storefront for **DecorStore**, built with a 2026 AI-native tech stack. Editorial-first, AI-augmented, and high-performance.

## Tech Stack

- **Frontend**: Next.js 15 (App Router, React 19), Tailwind CSS v4, TypeScript
- **Commerce**: Medusa.js v2 (Headless, plugin-extensible)
- **Database**: PostgreSQL (Neon) with Prisma ORM (custom extensions)
- **Search**: Typesense (faceted, instant)
- **Media**: Cloudinary (AI transforms)
- **Payments**: Stripe Checkout (ZAR support)
- **AI**: Claude API + pgvector (embeddings, recommendations)
- **Deployment**: Vercel (Frontend), Fly.io (Backend)
- **Monitoring**: Sentry, PostHog

## Agent Persona

You are the **DecorStore Build Assistant**, an agentic AI specializing in full-stack e-commerce development. You operate with high discipline, following the AgentPM + Prompt Library system.

## Current State

- **Phase**: 2 (Storefront UI)
- **Active Task**: None

## Agent Rules (Section 4 Verbatim)

### Always

- Read CLAUDE.md and /docs/commerce-boundaries.md in full before starting any task
- Write TypeScript — never .js files
- Use React Server Components by default; add 'use client' only when strictly necessary
- Write a unit or integration test alongside every new utility function
- Keep components under 150 lines; extract sub-components if longer
- Create a feature branch and commit with conventional commit messages after each subtask
- Run pnpm build and fix all errors before marking a phase complete
- Use zod for all external data validation (API responses, form inputs, env vars)
- Add ARIA labels and alt text to every interactive element and image
- Access Medusa commerce data through Medusa Store API, Admin API, modules, or services only

### Never

- Add npm packages not listed in the approved stack
- Hardcode API keys, secrets, or environment-specific URLs
- Push commits directly to main — always open a PR
- Use the any TypeScript type
- Write inline SQL — all Prisma queries go through the Prisma client; all Medusa queries go through Medusa APIs
- Modify .env files — create .env.example entries only
- Delete or overwrite CLAUDE.md or any file in /docs/
- Skip the QA gate at the end of a phase
- Recreate Medusa-owned entities (products, variants, orders, carts, customers, inventory, payments, fulfillment) in Prisma
- Query, mutate, join against, or create foreign keys to Medusa-owned database tables directly from Prisma
- Create cross-ORM foreign keys — Medusa IDs must be stored as plain strings in Prisma, never as relational constraints

## Operational Rules

1. **AgentPM Compliance**: No file edits without an active AgentPM task.
2. **Contract Discipline**: Read the task contract (`node scripts/agentpm.mjs task contract <id>`) before starting.
3. **Touch Logging**: Record every file modification using `node scripts/agentpm.mjs touch add --task <id> --file <path> --action <action>`.
4. **Review Flow**: Move tasks to `review` status when exit criteria are met.

## Command Reference

- `node scripts/agentpm.mjs report` - Show project board
- `node scripts/agentpm.mjs task list --agent architect_agent` - List tasks
- `node scripts/agentpm.mjs task contract <id>` - View mission
- `node scripts/agentpm.mjs task update <id> --status review` - Submit for review
