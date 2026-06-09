// Deterministic conductor: walks the plan DAG, assembles each stage's harness,
// dispatches to the worker, materializes output into an isolated workspace, runs the
// gate, and handles failure with bounded retries then human escalation. It is code,
// not a model.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { retrieve } from "./intel.mjs";
import { gate } from "./gate.mjs";

const MAX_RETRIES = 3;

export class Escalation extends Error {
  constructor(stage, detail) { super("escalation at stage " + stage); this.stage = stage; this.detail = detail; }
}

export function runPlan(plan, spec, worker, opts) {
  const { workspace, faults = {}, log = () => {} } = opts;
  const results = {};

  for (const stage of topo(plan.stages)) {
    const upstream = {};
    for (const d of stage.dependsOn) upstream[d] = results[d];

    let pass = false, gres = null, attempts = 0, gen = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      attempts = attempt;
      const harness = { spec, exemplar: retrieve(stage.type), upstream, attempt, faults };
      gen = worker.generate(stage, harness);
      materialize(gen.files, workspace);
      gres = gate(stage, gen, { workspace, spec });
      if (gres.pass) { pass = true; log({ type: "pass", stage: stage.id, attempt, gate: gres, provenance: gen.provenance }); break; }
      log({ type: "fail", stage: stage.id, attempt, gate: gres });
    }
    if (!pass) throw new Escalation(stage.id, gres);
    results[stage.id] = { gen, gate: gres, attempts };
  }
  return { results, workspace, planId: plan.planId };
}

function materialize(files, workspace) {
  for (const f of files) {
    const p = join(workspace, f.path);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, f.content);
  }
}

function topo(stages) {
  const done = new Set(), order = [];
  while (order.length < stages.length) {
    let progressed = false;
    for (const s of stages) {
      if (done.has(s.id)) continue;
      if (s.dependsOn.every((d) => done.has(d))) { order.push(s); done.add(s.id); progressed = true; }
    }
    if (!progressed) throw new Error("cyclic plan");
  }
  return order;
}
