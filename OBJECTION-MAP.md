# Objection Map — Software Factory Defense

Your defense prep. Each objection is the *hardest* version a panel will throw, surfaced by adversarially red-teaming the architecture. For genuine holes the move is **concede → reframe → commit**, never a fake rebuttal — a panel respects "you're right, here's how I'd close it" and punishes bluffing. Study Tier 1 cold; you can read Tier 3 off the page.

## The spine — four lines to return to under pressure

When a question spirals, come back to one of these. They are the decisions you'll defend to the end:

1. **Deterministic conductor, stochastic workers.** The orchestration is code and auditable; the model is a commodity part. Traceability is why this beats Ralph's swarm.
2. **Evals are the load-bearing layer.** Nothing advances a stage without passing a gate; that's what converts a stochastic brain into a measurable system.
3. **Humans stay on the gates; the trust ladder is *earned*, never scheduled.** Gates collapse only against production change-fail-rate, and for regulated repos they never fully collapse.
4. **The factory attacks the 78%, not the 22%.** Vendors optimize writing code; this encodes *Athena's* conventions, gates, and compliance — the part that doesn't come in a box.

---

## Tier 1 — The holes that can sink you

No good answer in the current doc. Own each, don't defend it.

### O1 · The 80% metric is measured on the easy denominator
**Attack:** "The PRD says pass CI *on first run* 80% of the time. You redefined it to 'reaches green within the retry budget' — of course it passes, you don't emit a PR until it does. You moved the goalposts."
**Exploits:** That CI-in-loop is a verification strategy, not a measurement dodge. The doc itself concedes the tension ("needs a precise definition") — the tell.
**Say:** "Fair — and I should lead with both numbers, not the convenient one. There are three: (1) internal yield — % reaching green within the retry budget without escalation; (2) the emitted PR's first run on the product's *own* CI, which is the PRD's literal metric and should sit near 100% by construction, with any gap being an environment-parity bug I monitor; (3) change-fail-rate in production, which is the only one the CTO should actually care about. I'd report all three and stop hiding behind the easy denominator."
**Commit:** Add the dual-metric statement and a parity-drift monitor between in-loop and product CI.
**Anchor:** §5 Real CI.

### O2 · There is no cost / ROI / latency math anywhere
**Attack:** "You generate 14 files with per-stage retries, multi-level LLM judges, and browser automation — for one CRUD feature. What does that cost in tokens and wall-clock, and is it cheaper than the 3.5 senior-days you replace? You're betting the delivery org on unit economics you never computed."
**Exploits:** That replacing human time is automatically net-positive.
**Say:** "It's the cleanest gap in the doc and I'll own it. The back-of-envelope: a CRUD feature is ~3.5 senior-days, call it ~$3–4k loaded. Token cost even with retries and judges is tens of dollars — two orders of magnitude below labor, so tokens are *not* the constraint. The real cost is human spec-and-review time plus platform amortization (3 eng × 60 days ≈ ~$150–200k to build). Break-even is a function of how much review time the trust ladder removes and how many CRUD features the portfolio ships — at 38% of features across 23 deploys/day, payback is months, not years. The ROI lever is review-time reduction, which is exactly what the trust ladder is built to earn."
**Commit:** Add a cost/latency envelope and a break-even-by-feature-volume section.
**Anchor:** new section; ties to §metrics.

### O3 · You can't causally prove the factory moved DORA
**Attack:** "Athena ships 23 deploys/day across seven products from squads already 30–40% more productive. Your factory touches CRUD on two products. When lead time moves, how do you prove it was you and not variance, the other six products, or the 8% gain already happening? Show me the counterfactual."
**Exploits:** That portfolio-level DORA — which the doc forbids isolating ("global outcome, not local") — can be attributed to one intervention.
**Say:** "Right — portfolio DORA is confounded by construction, so I don't claim it as v1 proof. v1 is proven on two things that *are* directly attributable: per-feature leading indicators (first-run yield, ≤30-min cleanup, pattern conformance) which the factory owns end-to-end, and a matched cohort — factory-built vs hand-built CRUD on the same product, same sprint. DORA is the program's north star, not the v1 scoreboard; it's what governs the trust ladder once the cohort and production signal accumulate."
**Commit:** Add an explicit measurement design — pilot-product baseline hold + factory-vs-hand cohort.
**Anchor:** §metrics (sequencing).

### O4 · Phase 0 can eat the whole 60 days — by your own admission
**Attack:** "Your own scope says standing up a legacy environment 'can eat as much of the 60 days as building the factory itself.' If Phase 0 takes 30 days, which half of the factory do you cut? And 'pick the two most tractable repos' means you demo on the easy case and defer the SOC 2/HIPAA repos that actually matter."
**Exploits:** That the pilot repos are clean brownfield; the doc hedges and never commits.
**Say:** "I named it because it's the real risk, so let me resolve it instead of hedging. Weeks 1–2 are a Phase-0 spike on both pilot repos with a hard go/no-go: if a repo can't be made reproducibly runnable in two weeks, it's swapped or v1 drops to one product. Choosing tractable repos first is deliberate risk management, not hiding — the gnarly regulated repo is Phase 2, *with* the hardening layer proven first. v1 success is defined on whatever clears Phase 0, stated up front."
**Commit:** Add a day-allocation with the Phase-0 go/no-go gate.
**Anchor:** §v1 scope (Phase 0 paragraph).

### O5 · Why build instead of buy or wait?
**Attack:** "Cursor, Devin, GitHub's agents, and Claude Code — which 72% of your engineers already run — are racing to exactly this. Why spend 3 engineers building an orchestrator a vendor ships in two quarters? Your own thesis says the model is a commodity 'same shared model' — so where's the moat?"
**Exploits:** That differentiation lives in orchestration; the doc concedes the model is commodity but never names the moat or does build-vs-buy.
**Say:** "Exactly because the model is commodity, the moat is the layer a vendor can't own: the seven-repo convention/exemplar index, the golden set grown from *our* production failures, and the eval harness that encodes what 'correct at Athena' means — including SOC 2/HIPAA gates. A vendor can index our repos; it can't own our acceptance criteria or our accumulated taste. Buy the model, build the harness around our constraints. And it's reversible — if a vendor ships the orchestration, our specs, skills, and evals port onto it. We're betting on the asset that compounds, not the part that's racing to zero."
**Commit:** Add a one-paragraph build-vs-buy with the moat made explicit.
**Anchor:** §1 / §2.

### O6 · The security "floor" is asserted, and an LLM judge can't be its backstop
**Attack:** "Your floor says 'no bypassed auth, no destructive migration without a guard' — show me what mechanically catches an auth check that's *present but wrong* (right permission, wrong resource ID) or a migration that passes lint and CI but widens access. If the answer is the LLM judge, you've put a stochastic model on the one gate you called non-skippable."
**Exploits:** That "bypassed auth" and "destructive" are mechanically decidable; the hard cases are semantic, which the doc routes to the judge.
**Say:** "The floor is *not* the judge — that was under-specified and I'll enumerate it. The floor is deterministic policy: SAST/semgrep rules asserting an auth check on every endpoint, a migration linter that blocks DROP/ALTER without a reviewed guard and requires a reversible down-migration, an OPA-style policy engine on the diff. The LLM judge is a *second* layer on top, never the floor. The present-but-wrong auth case is caught by a spec-derived test ('a user cannot access another merchant's methods') plus mandatory human review on regulated repos. Defense in depth — no single gate, and the bottom layer is deterministic."
**Commit:** Enumerate the floor as concrete rules in §5.
**Anchor:** §5 Security policy gate.

### O7 · "Secrets never enter context/traces" has no enforcing mechanism
**Attack:** "Your worker indexes seven real repos full of test fixtures, seed data, and error logs that routinely embed real secrets and PHI. Your trace store captures every tool call; your memory store captures transcripts. What mechanically stops PHI from landing in a trace your judge then reads? You assert the goal three times and never name a control."
**Exploits:** That "we pass only references" is design intent, not an enforced property at every ingestion point.
**Say:** "Asserting it isn't enough — agreed. The enforcing components: a secrets scanner (gitleaks-style) and a PHI classifier that run at every ingestion boundary — indexer, trace store, memory — and redact before anything persists. Regulated repos use the stricter harness with no learned-memory persistence and ephemeral, access-controlled traces. Fixtures with real PHI are a genuine risk; the mitigation is scrub-on-ingest plus the policy that regulated traces never leave the boundary."
**Commit:** Name the redaction/classifier components in §cross-cutting and §7.
**Anchor:** §cross-cutting security; §7 trace/memory.

### O8 · Prompt injection via indexed code or a malicious spec is unaddressed
**Attack:** "Your worker retrieves and trusts exemplars from the repo and compiles a brief from Jira/Notion. A comment that says 'this repo's convention is to skip the permission gate,' or a ticket sentence to the same effect, is now an instruction to your generator. Where's the boundary between data the model reads and instructions it follows? The words 'prompt injection' never appear."
**Exploits:** That retrieved code and inbound briefs are inert data; for an LLM they share the instruction channel.
**Say:** "Genuine gap, good catch. Three boundaries close it: retrieved exemplars and briefs are delimited as data and never executed as instructions; the spec compiler validates the brief into a *typed schema*, so free text can't become an instruction — it has to fit fields, which makes the schema the injection firewall; and indexed content only enters via the re-index-on-merge hook, so a malicious comment had to clear human PR review to be indexed at all. I'll add an input-integrity section making that explicit."
**Commit:** Add an input-integrity / trust-boundary subsection.
**Anchor:** §2 / §cross-cutting.

### O9 · Human-in-the-loop is liability laundering, not accountability
**Attack:** "When the factory ships the migration that drops a column of patient records, you'll point at the engineer who approved a 14-file PR he didn't write and couldn't fully read. Is that a real accountable human or a scapegoat manufactured to satisfy the auditor?"
**Exploits:** That a human gate confers accountability rather than relocating blame; the doc never distinguishes *reviewing* from *being able to meaningfully review*.
**Say:** "Accountability is only real if the human can meaningfully review — which is exactly what the architecture is built for: clean diffs, provenance, and a QA reviewer who tests *behavior against acceptance criteria* on a live environment, not line-by-line authorship. That's the same basis a senior reviews a junior's PR on today. The approver certifies behavior; the platform owners are accountable for the machinery — named, like any internal platform that can ship a bad deploy. For regulated repos the gate never collapses. The factory doesn't change *who's* liable; it changes *what they review* — architecture and behavior, spot-checking implementation."
**Commit:** Add an accountability model + named platform owner + permanent regulated-gate floor.
**Anchor:** §6.

### O10 · "Audit record = trace + report" is an assertion, not a mapped control
**Attack:** "Name the SOC 2 criterion or HIPAA §164 control that 'spec + traces + generation report' satisfies, with retention and tamper-evidence. An auditor tests whether a *control operated effectively* — 'the model decided' is not a control."
**Exploits:** That observability artifacts automatically constitute audit evidence; reproducibility ≠ auditability.
**Say:** "'Falls out of observability' overclaims — let me map it. Every change traces to an approved spec and a named approver, and spec author ≠ approver gives segregation of duties. That maps to SOC 2 CC8.1 (change management) and HIPAA §164.312(b) (audit controls), on an append-only, retained, tamper-evident trace store. It actually satisfies 'changes are reviewed and approved before production' *better* than the status quo because the record is automatically complete. Deterministic conductor gives reproducibility on top."
**Commit:** Map to named controls with retention + immutability in §cross-cutting.
**Anchor:** §cross-cutting; §1 audit trail.

### O11 · "The factory doubles as a restore tool" puts a stochastic model on the incident path
**Attack:** "During a live PHI breach you'd route the fix through a stochastic generator on a *fast lane* that skips the gates built to catch destructive changes? And if the factory *caused* the incident, the same machinery that broke it is now trusted to fix it. Explain how that isn't gasoline on the fire."
**Exploits:** That generation is fast and reliable under incident conditions, and that a fast lane can be fast *and* safe.
**Say:** "Two things got conflated and only one is credible. The real MTTR win is the feature-flag kill switch — instant, deterministic — plus provenance and characterization tests speeding diagnosis. Generating a *new* fix through the factory is not gate-skipping; incident fixes go through the same or stricter gates, just prioritized. And if the factory caused it, you roll back via flag/revert — you never ask it to fix itself. I'll rewrite the MTTR claim to make flag-rollback primary and never put generation on a gate-skipped critical path."
**Commit:** Rewrite §metrics MTTR — flag-rollback primary, generation never gate-skipped.
**Anchor:** §metrics (MTTR wiring).

---

## Tier 2 — Strong attacks, partial answers — sharpen and hold

You have an answer; a sharp panelist can still widen it. Tighten these.

### O12 · The correctness trick is Postgres-only; generalization is asserted
**Attack:** "Your marquee correctness move — 'unique-default becomes a partial index, not application code' — is Postgres-specific. What's the DynamoDB or Redis equivalent? It evaporates on three of your four engines, pushing the invariant back into app code where the LLM is least trustworthy. The 7-repo/3-language claim is never actually built in v1."
**Say:** "Right — the *guarantee* is engine-specific, and that's the honest framing. The factory's job isn't one universal trick; it's to encode each engine's best-available enforcement as a skill — a DB constraint where one exists, an application-level invariant *plus a spec-derived test asserting it* where one doesn't. v1 deliberately picks products where the relational enforcement holds; non-relational enforcement is a Phase-2 convention skill. I claim per-engine skills, not a universal guarantee."
**Anchor:** §2 exemplar store (engine-keyed).

### O13 · Evals catch syntax, not the spec author's blind spots
**Attack:** "Deterministic checks catch compile/lint/types. Functional correctness rests on spec-derived tests and an LLM judge — both bounded by the acceptance block. If the author forgot a criterion, the tests are confidently wrong *together* and the judge approves. Where's the independent ground truth for a novel feature?"
**Say:** "Correct is defined by acceptance criteria, so a missing criterion is the real blind spot — and no human team escapes that either. Three mitigations: the QA reviewer does *exploratory* testing, not just the generated tests; the pattern template ships the standard CRUD acceptance criteria so common omissions are templated in; and every production failure graduates into the golden set, closing the blind spot after first occurrence. The factory at least makes the criteria explicit and reusable instead of tribal."
**Anchor:** §1 acceptance criteria; §5 QA; §8 golden set.

### O14 · Same model everywhere = correlated failure, no independent vote
**Attack:** "'Every worker is the same model' means when the model has a systematic blind spot, the generator makes the error, the test-writer (same model) doesn't test for it, and the judge (same model) approves it. Three correlated draws. You removed the independent second opinion and call it a virtue."
**Say:** "True, and I won't pretend the LLM eval layers are independent votes — they're correlated with the generator. The independent axes are the deterministic checks (compile/lint/types/CI/SAST) and the human QA gate; those are what actually catch a systematic blind spot. Cheap added diversity is running the judge on a *different* model, which I'd do for high-risk stages. But I rely on deterministic-plus-human for independence, not on stacked LLM evals."
**Anchor:** §metrics (same-brain); §8.

### O15 · Bounded retries on a stochastic model don't converge
**Attack:** "A retry is the same model, same harness, same input — why would attempt 2 differ except by sampling noise? And if frontend fails because the api contract is subtly wrong, checkpointed re-runs of frontend against a bad upstream artifact can never pass. What's the cross-stage rollback?"
**Say:** "Retries aren't re-rolls — the failure (the error, the failing test) feeds back as new context, so attempt 2 is a different prompt. And a downstream failure that looks like an upstream fault flags the upstream artifact as suspect and escalates rather than retrying forever against a bad contract. Typed handoffs catch *type* mismatches; semantic upstream faults are caught by the downstream stage's eval failing and triggering upstream re-examination."
**Anchor:** §3 failure recovery (specify retry-with-context + upstream-fault escalation).

### O16 · The v1 scope is a platform team's roadmap in 3 × 60
**Attack:** "Structural symbol-and-dependency graph across multiple languages, isolated env provisioner, an LLM judge calibrated against held-out human decisions — each is multi-engineer-months. Three people, sixty days. Name the one that doesn't ship."
**Say:** "The deferral table is real scope control, and I'll extend it to the heavyweight items. v1 cuts them to MVP: retrieval is semantic + exemplar first, structural graph deferred; the env provisioner uses the repo's existing docker-compose + worktrees, not bespoke infra; the judge is sanity-checked in v1, formal calibration is Phase 2. If Phase 0 is hard, v1 is one product. I'd rather ship a true thin slice than an oversold two-product build."
**Anchor:** §v1 scope (extend deferral table).

### O17 · Cold-start contradicts your own stated failure mode
**Attack:** "Cold-start is 'index, report, validate once.' But you also say a stale index is the most likely silent cause of missing the bar, and that exemplar extraction finds five competing conventions needing a human curator, and that Phase 0 can eat the whole budget. Those can't all be cheap."
**Say:** "'Validate once' was too breezy — per-repo onboarding is a sized project, not a one-shot. Honest cold-start: index → conventions report → human curates competing conventions into a blessed baseline → validate. Days for a clean repo, weeks for a gnarly one — which is the Phase-0 budget I already flag. I'll drop the breezy framing."
**Anchor:** §2 cold start; §v1 scope.

### O18 · Heavier process on engineers who already feel productive
**Attack:** "Your engineers report 30–40% gains with tools they *chose*. Now you tell a senior to stop writing code, author a schema-validated spec, wait through gated stages, and do mandatory QA on a machine's output — and you've centralized the factory as a single point of failure. Why does she adopt this? Does it de-skill her?"
**Say:** "Engineers adopt it because it removes the 78% they hate — config, convention-hunting, migrations, staging — not the craft they enjoy; they move *up* to spec and architecture review. Shared infra isn't coercion, it's shared CI — and per-engineer factories are exactly the fragmentation the source warns against. Named platform owner, not an orphan. De-skilling is the compiler/framework concern restated; mitigated by keeping humans on architecture and the coherence pass."
**Anchor:** §6; §4 ownership.

---

## Tier 3 — Solid answers — deploy and move on

Confident ground. State it and don't linger.

- **O19 · "How is this not Ralph or BMAD?"** Deterministic conductor + typed artifacts + eval gates. The swarm is opaque; this is traceable and auditable — the exact property a regulated shop needs. Typed `api-contract.artifact` (shown in §9) is the named fix for BMAD's prose-handoff brittleness.
- **O20 · "What's genuinely novel vs. a wrapper?"** It's integration, not invention — and that's the point: typed handoffs, per-engine exemplars, characterization-gated brownfield surgery, four-level evals turning stochastic generation into a gated system. The value is the *system*, not a new algorithm. (Pair this with O5's moat answer.)
- **O21 · "Won't the self-improving loop game itself?"** v1 defers auto-graduation, so the loop isn't closed yet. Steady-state, the golden set grows from *production failures and human QA* — external ground truth — not the factory's own confidence, and the judge is calibrated against held-out *human* decisions. The external signals keep it honest.
- **O22 · Golden-set bootstrap (10–15 specs is thin).** Acknowledged and scoped — it's a v1 seed; the gates are backed by deterministic checks and human QA while it grows. It's explicitly a lagging signal that sharpens exactly where the factory has been wrong.
- **O23 · Characterization tests assume testable code.** Owned in the doc: uncharacterizable code is escalated, not touched blindly. Honest limit — the factory adds fresh code safely and changes *characterizable* code safely; the tangled rest stays human, which is the correct call, not a gap to paper over.

---

## The meta-rule

The through-line a panel will hammer: the doc treats *human-in-the-loop*, *hardcoded floor*, *secrets never in traces*, and *audit record* as **guarantees** when each is currently an **unspecified aspiration**. Your strongest overall move is to say that out loud first — "v1 names these as intentions; here are the enforcing components I'd build for each" — and turn the four softest claims into the four most concrete commitments. A panel forgives a known, scoped gap. It does not forgive a guarantee that dissolves under one question.
