# payments-dashboard — product profile

Stable, product-wide conventions baked into the per-product system prompt. Volatile
feature context is retrieved at generation time.

- Language: TypeScript (frontend), Node ESM services. Database: Postgres.
- Migrations: `migrations/NNN_*.sql` with explicit `-- migrate:up` / `-- migrate:down`
  sections. A migration without a reversible down is rejected by the security floor.
- Services: a `create<Entity>Service(repo, opts)` factory; permission checks via
  `requirePerm`; an audit mixin writes `{actor, action, before, after}` on every mutation.
- Sensitive fields are stored as Vault references only (`vault_ref`); raw credentials
  never touch the database, logs, or the UI.
- Tables/lists use the shared `DataTable` component with `sortable` / `filterable`.
- Permissions look like `resource:action` (e.g. `payment_methods:manage`).
