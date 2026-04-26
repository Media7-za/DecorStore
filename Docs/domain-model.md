# Domain Model

This project maintains a strict separation between Medusa-owned commerce entities and Prisma-owned custom extensions.

## Medusa-Owned (Commerce Domain)

Medusa is the source of truth for these entities. Access them only via Medusa APIs/Modules.

| Entity             | Description                                   | Access Path               |
| :----------------- | :-------------------------------------------- | :------------------------ |
| **Product**        | Core product data, descriptions, metadata     | Medusa Store/Admin API    |
| **ProductVariant** | SKU, pricing, inventory levels                | Medusa Store/Admin API    |
| **Category**       | Product categorization hierarchy              | Medusa Store/Admin API    |
| **Cart**           | Shopping cart state and line items            | Medusa Store API          |
| **Order**          | Completed transactions and fulfillment status | Medusa Admin/Store API    |
| **Customer**       | Identity, authentication, and profiles        | Medusa Store API          |
| **Address**        | Shipping and billing addresses                | Medusa Store API          |
| **Inventory**      | Stock levels across locations                 | Medusa Inventory Module   |
| **Payment**        | Transactions, Stripe sessions, refunds        | Medusa Payment Module     |
| **Fulfillment**    | Shipping labels, tracking, returns            | Medusa Fulfillment Module |

## Prisma-Owned (Custom Extensions)

Prisma models only custom DecorStore extensions.

| Entity               | Key Fields                                             | Purpose                                 |
| :------------------- | :----------------------------------------------------- | :-------------------------------------- |
| **StyleProfile**     | `medusaCustomerId`, `quizAnswers`, `recommendedStyles` | AI-generated style preferences          |
| **RoomMoodBoard**    | `medusaCustomerId`, `name`, `productIds`               | User-created design collections         |
| **ProductEmbedding** | `medusaProductId`, `vector`, `model`                   | pgvector embeddings for semantic search |
| **DecorPreference**  | `medusaCustomerId`, `styleWeights`                     | Dynamic user weighting for reco engine  |
| **BlogPost**         | `title`, `slug`, `body`, `publishedAt`                 | Editorial journal content               |
| **BlogAuthor**       | `name`, `bio`, `avatarUrl`                             | Content creators                        |
| **AgentAuditLog**    | `phase`, `command`, `status`, `durationMs`             | Traceability of AI agent actions        |
| **SiteConfig**       | `key`, `value`                                         | Global flags (VAT, shipping thresholds) |

## Cross-Boundary References

- All references from Prisma to Medusa entities (e.g., `medusaProductId`) are stored as **plain strings**.
- **No foreign key constraints** are allowed across the Medusa/Prisma boundary.
- Referential integrity is managed in the service layer.
