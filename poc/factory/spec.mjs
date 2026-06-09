// Spec compiler + validator + acceptance derivation.
// The one place natural-language intent becomes a typed, gated contract.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export class SpecError extends Error {}

export function compileBrief(briefPath) {
  const text = readFileSync(briefPath, "utf8");
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) throw new SpecError("brief has no structured ```json spec block");
  let input;
  try { input = JSON.parse(m[1]); }
  catch (e) { throw new SpecError("structured spec block is not valid JSON: " + e.message); }

  const spec = normalize(input);
  validate(spec);                          // incomplete spec -> no plan, no code
  spec.acceptance = deriveAcceptance(spec); // the compiler's value-add: intent, not shape
  spec.specId = "spec-" + createHash("sha1").update(JSON.stringify(input)).digest("hex").slice(0, 8);
  return spec;
}

const PATTERNS = new Set(["crud_ui"]);

function normalize(input) {
  return {
    product: input.product,
    pattern: input.pattern,
    entity: input.entity,
    table: input.table || toSnakePlural(input.entity || ""),
    fields: input.fields || [],
    permissions: input.permissions || null,
    audit: !!input.audit,
    integrations: input.integrations || [],
    ui: input.ui || {},
  };
}

function validate(s) {
  for (const k of ["product", "pattern", "entity"]) if (!s[k]) throw new SpecError("spec missing required field: " + k);
  if (!PATTERNS.has(s.pattern)) throw new SpecError("unknown pattern: " + s.pattern);
  if (!Array.isArray(s.fields) || s.fields.length === 0) throw new SpecError("spec must declare at least one field");
  for (const f of s.fields) if (!f.name || !f.kind) throw new SpecError("each field needs name and kind");
  if (s.permissions && !/^[a-z_]+:[a-z_]+$/.test(s.permissions)) throw new SpecError("permission must look like resource:action");
}

function deriveAcceptance(s) {
  const a = [];
  if (s.fields.find((f) => f.name === "is_default")) {
    a.push("exactly one " + s.entity + " is default per merchant");
    a.push("deleting the default promotes the next method by created_at");
  }
  if (s.audit) a.push("every create/update/delete writes an audit entry with actor and before/after");
  if (s.permissions) a.push("a user without " + s.permissions + " receives 403 on every endpoint");
  for (const f of s.fields) if (f.sensitive) a.push(f.name + " is stored as a reference only; raw credentials never touch the database or logs");
  return a;
}

function toSnakePlural(entity) {
  return entity.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase() + "s";
}
