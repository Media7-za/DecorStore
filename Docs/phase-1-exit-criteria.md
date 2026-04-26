# Phase 1 Exit Criteria: Project Scaffold

Phase 1 is complete only when all of the following conditions are met. The human operator must manually verify and tick each box.

## Authority Files (Step 0)

- [ ] `CLAUDE.md` updated with brand, stack, persona, rules.
- [ ] `docs/architecture.md` exists with system overview.
- [ ] `docs/domain-model.md` lists all entities with owners.
- [ ] `docs/commerce-boundaries.md` codifies ORM boundary rules.
- [ ] `docs/agent-rules.md` matches spec Section 4.
- [ ] `docs/mcp-permissions.md` matches spec Section 5.
- [ ] `docs/phase-1-exit-criteria.md` exists.

## Monorepo & Toolchain

- [ ] `pnpm-workspace.yaml` configured with apps/web, apps/api, packages/ui, packages/db.
- [ ] `.env.example` created with all service slots.
- [ ] `tsconfig.json` set to strict mode with path aliases.
- [ ] ESLint and Prettier configured for the monorepo.
- [ ] Husky pre-commit hooks installed (lint + tsc).
- [ ] `.github/workflows/ci.yml` exists and covers lint, type-check, and test.

## Data Layer (Prisma)

- [ ] `packages/db/prisma/schema.prisma` contains ONLY custom extensions.
- [ ] No foreign keys to Medusa tables in Prisma schema.
- [ ] `packages/db/prisma/seed.ts` seeds SiteConfig and sample BlogPosts only.
- [ ] Initial migration generated and applied.

## Verification Gates

- [ ] **Medusa Health**: `curl http://localhost:9000/health` returns 200.
- [ ] **Prisma Migration**: `prisma migrate deploy` exits 0.
- [ ] **Monorepo Build**: `pnpm build` passes with zero errors/type-errors.
- [ ] **CI Status**: GitHub Actions pipeline is green on the Phase 1 PR.

---

_Operator Signature: ********\_\_\_\_******** Date: ****\_\_****_
