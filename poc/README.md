# Software factory — runnable POC slice

A vertical slice that **runs** the architecture in [`../Software Factory Architecture.md`](../Software%20Factory%20Architecture.md): it takes the Payment Methods brief and produces a reviewable PR, with the eval gates and CI **actually executing** — not narrated.

The point of the slice is to prove the *harness*, which is the architecture's claim to value ("the model is a commodity; only the harness differs"). So the worker here is a deterministic `TemplateWorker` behind a `Worker` interface, with the LLM seam marked in [`factory/worker.mjs`](factory/worker.mjs). Everything around it — the deterministic conductor, the plan DAG, typed artifact handoffs, the per-stage eval gates, and CI-in-the-loop — is real.

## Run it

Requires Node ≥ 18 (uses the built-in `node:test`). No `npm install`.

```bash
node run.mjs                 # happy path: brief -> spec -> plan -> gated stages -> PR
node run.mjs --flaky migrate # a stage fails its gate once, retry recovers
node run.mjs --fail api      # a compiles-but-wrong change; CI gate catches it, escalates
```

The generated PR lands in `out/<planId>/PR.md` with the generated files under `out/<planId>/files/`.

## What each run proves

| Run | Demonstrates | Answers objection |
|-----|--------------|-------------------|
| happy path | brief → typed spec (with derived acceptance criteria) → DAG → 5 gated stages → **CI runs 5 real tests, green** → PR with provenance | "does it actually work / is the worked example real" |
| `--flaky migrate` | the security-floor gate rejects a migration with no reversible `down`; bounded **retry recovers** | within-stage failure recovery |
| `--fail api` | a service that **compiles and passes lint** but violates "one default per merchant"; the **CI gate catches it**, retries, then **escalates to a human** (exit 1) | the *compiles-vs-correct* gap (O13/O15); CI-in-loop is load-bearing, not decoration |

## How it maps to the architecture

| Architecture component | Here |
|------------------------|------|
| Spec authoring + validator + acceptance criteria (§1) | [`factory/spec.mjs`](factory/spec.mjs) |
| Codebase intelligence / exemplar retrieval (§2) | [`factory/intel.mjs`](factory/intel.mjs) + [`sample-repo/`](sample-repo) |
| Plan generator → DAG (§2, §3) | [`factory/plan.mjs`](factory/plan.mjs) |
| Deterministic conductor, typed handoffs, retry/escalate (§3) | [`factory/conductor.mjs`](factory/conductor.mjs) |
| Harnessed worker + skills (§4) | [`factory/worker.mjs`](factory/worker.mjs), [`factory/skills.mjs`](factory/skills.mjs) |
| Eval gate: structural + security floor + CI-in-loop (§5, §8) | [`factory/gate.mjs`](factory/gate.mjs) |
| Generation report / PR with provenance (§6) | [`factory/report.mjs`](factory/report.mjs) |

`sample-repo/` is the stand-in target product ("payments-dashboard"): its `conventions.md` is the product profile and `exemplars/` are the canonical patterns the factory retrieves so generated code reads as native.

## Honest scope (what's real vs. stand-in)

- **Real and executing:** the conductor and DAG walk; the typed `api-contract` artifact passed from the `api` stage into `frontend`; every per-stage gate; and the `tests` gate, which writes the generated service + spec-derived tests to an isolated workspace and runs the **product test runner** (`node --test`) against them. First-run-green is measured, not asserted.
- **Stand-in for the demo:** the worker is a deterministic template, not an LLM (the marked seam). The migration (SQL), UI (TSX), and config (YAML) are emitted as artifacts checked by structural/policy gates rather than executed — the runnable verification focuses on the domain/API layer, where the acceptance criteria live. In production each stage's worker is the shared model and each gate is the product's real CI.
