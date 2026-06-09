# Athena Digital — The Software Factory

A response to the "Software Factory" case study ([`PRD-Athena.md`](PRD-Athena.md)): a design for a system that turns a feature spec into a reviewable, deployable pull request across seven products — plus a **runnable proof** of the core.

## Contents

- **[Software Factory Architecture.md](Software%20Factory%20Architecture.md)** — the full design: spec-driven, skill-composed, eval-gated. Diagrams render at the live site below.
- **Live site:** https://heilashahidi.github.io/athena-software-factory/ — the architecture rendered with all 8 diagrams.
- **[poc/](poc/)** — a runnable vertical slice. `node poc/run.mjs` takes the Payment Methods brief and produces a reviewable PR with the eval gates and CI **actually executing**. See [`poc/README.md`](poc/README.md).
- **[OBJECTION-MAP.md](OBJECTION-MAP.md)** — defense prep: the hardest panel objections with concede-reframe-commit answers.
- **[building-your-own-software-factory-summary.md](building-your-own-software-factory-summary.md)** — the source talk the design draws on.

## Run the proof

```bash
cd poc
node run.mjs                 # brief -> spec -> plan -> gated stages -> PR (first-run CI green)
node run.mjs --flaky migrate # a stage fails its gate once; bounded retry recovers
node run.mjs --fail api      # a compiles-but-wrong change; the CI gate catches it and escalates
```

Requires Node ≥ 18 (uses the built-in `node:test`). No `npm install`.
