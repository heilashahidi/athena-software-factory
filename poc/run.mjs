// Athena software factory — POC runner. brief -> spec -> plan -> gated stages -> PR.
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { rmSync } from "node:fs";
import { compileBrief, SpecError } from "./factory/spec.mjs";
import { generatePlan } from "./factory/plan.mjs";
import { TemplateWorker } from "./factory/worker.mjs";
import { runPlan, Escalation } from "./factory/conductor.mjs";
import { writePR } from "./factory/report.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

const briefPath = opt("--brief") || join(here, "specs", "payment-methods.brief.md");
const faults = { fail: new Set(), flaky: new Set() };
if (opt("--fail")) faults.fail.add(opt("--fail"));
if (opt("--flaky")) faults.flaky.add(opt("--flaky"));

const C = { dim: "\x1b[2m", g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", b: "\x1b[1m", x: "\x1b[0m" };
const h = (s) => console.log("\n" + C.b + s + C.x);

try {
  h("1 · Spec compiler   brief -> typed spec");
  const spec = compileBrief(briefPath);
  console.log("  " + spec.specId + " · " + spec.entity + " · " + spec.fields.length + " fields · pattern " + spec.pattern);
  console.log("  derived acceptance criteria (the definition of done):");
  for (const a of spec.acceptance) console.log("    " + C.dim + "- " + a + C.x);
  console.log("  " + C.dim + "[human gate] spec approved" + C.x);

  h("2 · Plan generator   spec -> DAG");
  const plan = generatePlan(spec);
  for (const s of plan.stages) console.log("  " + s.id.padEnd(9) + " <- " + (s.dependsOn.join(", ") || "(no deps)"));
  console.log("  " + C.dim + "[human gate] plan approved · nothing runs before migrate" + C.x);

  h("3 · Conductor   walk DAG · skill per stage · eval gate in the loop");
  const outDir = join(here, "out", plan.planId);
  rmSync(outDir, { recursive: true, force: true });
  const run = runPlan(plan, spec, new TemplateWorker(), {
    workspace: join(outDir, "workspace"),
    faults,
    log: (e) => {
      if (e.type === "pass") {
        const ci = e.gate.ci ? "  " + C.b + "[CI " + e.gate.ci.summary + "]" + C.x : "";
        console.log("  " + C.g + "PASS" + C.x + " " + e.stage.padEnd(9) + " attempt " + e.attempt + ci);
        console.log("       " + C.dim + e.provenance + C.x);
      } else {
        const bad = (e.gate.checks || []).filter((c) => !c.pass).map((c) => c.name + (c.detail ? " (" + c.detail + ")" : "")).join("; ");
        console.log("  " + C.y + "FAIL" + C.x + " " + e.stage.padEnd(9) + " attempt " + e.attempt + " -> retry  " + C.dim + bad + C.x);
      }
    },
  });

  h("4 · Assemble reviewable PR");
  const prPath = writePR(plan, spec, run, outDir);
  console.log("  CI in the loop: " + C.g + run.results.tests.gate.ci.summary + C.x);
  console.log("  PR: " + C.b + relative(here, prPath) + C.x);
  console.log("\n" + C.g + "✓ factory run complete — first-run CI green, PR ready for human review" + C.x + "\n");
} catch (e) {
  if (e instanceof SpecError) {
    console.error("\n" + C.r + "spec rejected: " + e.message + C.x);
    console.error(C.dim + "no plan, no code — an incomplete spec cannot compile" + C.x + "\n");
    process.exit(2);
  }
  if (e instanceof Escalation) {
    console.error("\n" + C.r + "ESCALATED to human at stage '" + e.stage + "' after bounded retries." + C.x);
    if (e.detail && e.detail.ci) console.error(C.dim + "CI: " + e.detail.ci.summary + " — a change that compiles but fails the spec is blocked, not shipped." + C.x);
    if (e.stage === "tests") console.error(C.dim + "note: a tests-gate failure usually means an upstream fault (api); surfaced rather than retried blindly." + C.x);
    console.error("");
    process.exit(1);
  }
  throw e;
}
