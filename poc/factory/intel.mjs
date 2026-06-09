// Codebase intelligence (POC slice): exemplar retrieval keyed by stage type.
// Returns the canonical pattern for this product so generated code reads as native,
// and a provenance pointer the report can show.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "sample-repo");

const MAP = {
  db_migration: "exemplars/migration.sql",
  rest_endpoints: "exemplars/crud-service.mjs",
  react_components: "exemplars/table-component.tsx",
  test_suite: "exemplars/crud-service.mjs",
  feature_flags_and_permissions: "conventions.md",
};

export function retrieve(stageType) {
  const rel = MAP[stageType];
  if (!rel) return { path: "(none)", excerpt: "" };
  const path = join(repo, rel);
  const excerpt = existsSync(path) ? readFileSync(path, "utf8").split("\n").slice(0, 4).join("\n") : "";
  return { path: "sample-repo/" + rel, excerpt };
}
