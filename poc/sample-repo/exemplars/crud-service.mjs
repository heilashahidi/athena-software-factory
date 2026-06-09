// CANONICAL EXEMPLAR — the shape every CRUD service in payments-dashboard follows.
// The factory retrieves this so generated services read as native.
export const PERMISSION = "billing:manage";
const KEYS = ["label", "amount_cents"];

function requirePerm(ctx) {
  if (!ctx || !Array.isArray(ctx.permissions) || !ctx.permissions.includes(PERMISSION)) {
    const e = new Error("forbidden"); e.status = 403; throw e;
  }
}

export function createInvoiceService(repo, opts) {
  const audit = !!(opts && opts.audit);
  return {
    list(ctx) { requirePerm(ctx); return repo.all(ctx.merchantId); },
    create(ctx, input) {
      requirePerm(ctx);
      const row = Object.assign({ id: repo.nextId(), merchantId: ctx.merchantId }, input);
      repo.insert(row);
      if (audit) repo.audit(ctx, "create", null, row);
      return row;
    },
  };
}
