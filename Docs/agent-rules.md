# Agent Authority Rules

These rules are non-negotiable and are enforced on every agent run.

## Always

- **Read CLAUDE.md and /docs/commerce-boundaries.md** in full before starting any task.
- **Write TypeScript** — never .js files.
- **Use React Server Components** by default; add 'use client' only when strictly necessary.
- **Write a unit or integration test** alongside every new utility function.
- **Keep components under 150 lines**; extract sub-components if longer.
- **Create a feature branch** and commit with conventional commit messages after each subtask.
- **Run pnpm build** and fix all errors before marking a phase complete.
- **Use zod** for all external data validation (API responses, form inputs, env vars).
- **Add ARIA labels and alt text** to every interactive element and image.
- **Access Medusa commerce data** through Medusa Store API, Admin API, modules, or services only.

## Never

- **Add npm packages** not listed in the approved stack.
- **Hardcode API keys**, secrets, or environment-specific URLs.
- **Push commits directly to main** — always open a PR.
- **Use the any TypeScript type**.
- **Write inline SQL** — all Prisma queries go through the Prisma client; all Medusa queries go through Medusa APIs.
- **Modify .env files** — create .env.example entries only.
- **Delete or overwrite CLAUDE.md** or any file in /docs/.
- **Skip the QA gate** at the end of a phase.
- **Recreate Medusa-owned entities** (products, variants, orders, carts, customers, inventory, payments, fulfillment) in Prisma.
- **Query, mutate, join against, or create foreign keys** to Medusa-owned database tables directly from Prisma.
- **Create cross-ORM foreign keys** — Medusa IDs must be stored as plain strings in Prisma, never as relational constraints.

## Escalate to Human Operator When:

- A required API key is missing from the environment.
- A build error cannot be resolved after 3 automated attempts.
- A dependency version conflict requires stack deviation.
- Any task would require accessing Medusa database tables directly rather than through the approved API paths.
- A feature requires cross-boundary data orchestration — escalate so service layer architecture can be confirmed before coding begins.
