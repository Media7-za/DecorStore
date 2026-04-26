# MCP Permissions Matrix

The agent has access to the following MCP servers with defined permission scopes.

| MCP Server      | Phase Active | Permission Scope | Allowed Actions                                                              |
| :-------------- | :----------- | :--------------- | :--------------------------------------------------------------------------- |
| **GitHub MCP**  | All Phases   | Read + Write     | Create branches, commits, PRs, read CI status, tag releases.                 |
| **Vercel MCP**  | 1, 6         | Deploy Only      | Trigger deploys, set env vars, read build logs, manage domains.              |
| **Stripe MCP**  | 3, 6         | Config Only      | Create products/prices, configure webhooks, test checkout (no live charges). |
| **DB / Prisma** | 1, 3, 5      | Read + Write     | Run migrations, seed data, query schema, optimize slow queries.              |
| **Sentry MCP**  | 6+           | Read + Patch     | Fetch error traces, auto-patch bugs, close resolved issues.                  |
| **Cloudinary**  | 5            | Upload Only      | Upload product images, apply transforms, generate srcsets.                   |
| **Typesense**   | 3, 5         | Read + Write     | Create collections, index products, configure ranking rules.                 |

## Permission Definitions

- **Read + Write**: Full CRUD operations.
- **Config Only**: Restricted to non-transactional setup.
- **Deploy Only**: Prevent config changes, allow deployment triggers.
- **Upload Only**: Prevent reading sensitive data, allow asset uploads.

## Idempotency Rule

All external actions via MCP must be safe to retry. Agents must check for existence before creating any external resource (e.g., check for existing Stripe product before creation).
