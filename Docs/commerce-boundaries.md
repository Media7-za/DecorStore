# Commerce Boundaries

This document codifies the ORM boundary rules to ensure architectural integrity between Medusa v2 and Prisma.

## The Hard Boundary

There is a hard boundary between the **Commerce Domain** (Medusa) and the **Extension Domain** (Prisma). These two layers must never be conflated at the database level.

### 1. ORM Restrictions

- **No Raw SQL**: Agents must never write raw SQL to query Medusa tables from the Prisma side.
- **No Direct Joins**: It is forbidden to perform database-level joins between Prisma tables and Medusa tables.
- **No Cross-ORM Constraints**: Do not create foreign keys in Prisma that point to Medusa tables. Use plain `String` fields for IDs.

### 2. Approved Access Paths

All commerce data must be accessed through one of these approved paths:

- **Medusa Store API**: `http://localhost:9000/store/...` (Client-side or Frontend Server-side)
- **Medusa Admin API**: `http://localhost:9000/admin/...` (Backend internal or Admin UI)
- **Medusa Modules/Services**: Injected via the Medusa dependency injection container (Backend internal).
- **Medusa Workflows**: Orchestrated commerce operations.

### 3. Service Layer Orchestration

Orchestration between Medusa and Prisma data must happen exclusively in the **Service Layer**.

**CORRECT Pattern:**

```typescript
async function getProductWithStyle(medusaProductId: string) {
  const product = await medusaClient.products.retrieve(medusaProductId);
  const embedding = await prisma.productEmbedding.findUnique({ where: { medusaProductId } });
  return { ...product, embedding };
}
```

**FORBIDDEN Pattern:**

```typescript
// NEVER DO THIS: Attempting to join in a single query or mixing logic in components
const data = await prisma.$queryRaw`SELECT * FROM products JOIN custom_data ...`;
```

### 4. Read Model Strategy

For high-performance pages (like PDP or Search) that require combined data:

- Use **Read Models**: Create denormalized cache tables in Prisma.
- **Sync via Subscribers**: Update Prisma read models by subscribing to Medusa events (e.g., `product.updated`).
- **Prioritize Consistency**: Eventual consistency is preferred over runtime cross-source joins.
