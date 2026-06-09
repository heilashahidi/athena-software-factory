// Eval gate: per-stage verification woven into the loop. Structural + policy checks
// for most stages; the product's real test runner (CI in the loop) for the tests stage.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export function gate(stage, gen, ctx) {
  const checks = [];
  const add = (name, pass, detail = "") => checks.push({ name, pass, detail });
  const content = gen.files[0].content;

  if (stage.id === "migrate") {
    add("creates table", /CREATE TABLE\s+\w+/.test(content));
    add("reversible down migration (security floor)", /--\s*migrate:down/.test(content));
    const downIdx = content.indexOf("migrate:down");
    const dropBeforeDown = /DROP\s+TABLE/i.test(downIdx >= 0 ? content.slice(0, downIdx) : content);
    add("no destructive op without guard", !dropBeforeDown);
  } else if (stage.id === "api") {
    add("syntactically valid", nodeCheck(gen.files[0], ctx.workspace));
    add("exports service factory", /export function create\w+Service/.test(content));
    add("permission gate present", /requirePerm/.test(content) && /403/.test(content));
  } else if (stage.id === "frontend") {
    const cols = ctx.spec.fields.filter((f) => !f.sensitive).map((f) => camel(f.name));
    add("consumes api contract columns", cols.every((c) => content.includes(c)));
    add("gates on permission", /can\(PERMISSION\)/.test(content));
    add("excludes sensitive fields from UI", ctx.spec.fields.filter((f) => f.sensitive).every((f) => !content.includes(camel(f.name))));
  } else if (stage.id === "tests") {
    const ci = runCI(ctx.workspace, ctx.spec);
    add("CI: spec-derived tests pass", ci.pass, ci.summary);
    return { pass: ci.pass, checks, ci };
  } else if (stage.id === "config") {
    add("declares feature flag", /flag:/.test(content));
    add("registers permission", /permission:/.test(content));
  }
  return { pass: checks.every((c) => c.pass), checks };
}

function nodeCheck(file, workspace) {
  const r = spawnSync(process.execPath, ["--check", join(workspace, file.path)], { encoding: "utf8" });
  return r.status === 0;
}

function runCI(workspace, spec) {
  const testFile = join(workspace, "src", spec.table, "service.test.mjs");
  const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", testFile], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const pass = Number((out.match(/#\s*pass\s+(\d+)/) || [])[1] || 0);
  const fail = Number((out.match(/#\s*fail\s+(\d+)/) || [])[1] || 0);
  // green requires a clean exit AND at least one passing test (no vacuous pass)
  return { pass: r.status === 0 && pass > 0 && fail === 0, summary: pass + " passed, " + fail + " failed", raw: out };
}
