export const NODE_DETAILS = {
  spec: {
    label: 'Spec',
    role: 'Source of truth',
    mermaid: `flowchart TB
  brief[/"Product brief · Linear / Jira / Notion"/] --> compiler["Spec compiler · brief to typed spec"]
  template[("Pattern template · CRUD / Integration / ...")] --> compiler
  compiler --> spec[/"Formal spec · fields + acceptance criteria"/]
  spec --> split{"Oversized?"}
  split -->|"yes"| smaller["Split into one-feature specs"]
  smaller -.-> spec
  split -->|"no"| validate{"Validator · complete + consistent vs codebase"}
  intel[["Codebase intelligence"]] -.->|"structural index"| validate
  validate -->|"incomplete / conflict"| back["Back to author"]
  back -.-> compiler
  validate -->|"valid"| approve{"Human gate · approve spec"}
  approve --> versioned[("Versioned spec + audit trail")]
  versioned --> plan[/"to Plan generator"/]
  amend["Worker decision off-spec"] -.->|"proposed amendment"| approve
  classDef stage fill:#E1F5EE,stroke:#0F6E56,color:#04342C
  classDef store fill:#EEEDFE,stroke:#534AB7,color:#26215C
  classDef io fill:#F1EFE8,stroke:#5F5E5A,color:#2C2C2A
  classDef human fill:#FAEEDA,stroke:#854F0B,color:#412402
  classDef warn fill:#FCEBEB,stroke:#A32D2D,color:#501313
  class compiler,smaller stage
  class template,versioned,intel store
  class brief,spec,plan io
  class approve human
  class back,amend warn`,
    color: '#F1EFE8',
    border: '#5F5E5A',
    text: '#2C2C2A',
    details: [
      'Engineers paste a product brief (Linear ticket, Jira issue, Notion doc) and the Spec Compiler transforms it into a typed, schema-validated spec — fields, constraints, and acceptance criteria all machine-readable.',
      'Pattern templates for common feature types (CRUD, Integration, Workflow, Analytics) are merged in automatically, so repetitive boilerplate never has to be written from scratch.',
      'The Validator gates the spec before anything else runs: missing acceptance criteria, ambiguous fields, or contradictions with existing code surface here, not mid-generation.',
      'A consistency check against the live Codebase Intelligence index catches conflicts — a field that collides with an existing table column, a route that duplicates an existing endpoint — before a single line of code is generated.',
      'Human approval turns the spec into an immutable, versioned record. Every downstream artifact — migration, API, frontend, tests — traces back to a specific field in that record.',
      'One spec = one feature = one PR. Batch discipline is enforced here, upstream; the factory never receives an oversized spec.',
    ],
  },
  router: {
    label: 'Risk Router',
    role: 'Tier assignment',
    color: '#FAEEDA',
    border: '#854F0B',
    text: '#412402',
    details: [
      'The Risk Router reads the validated spec and assigns a tier before a single worker is scheduled — risk classification happens at the decision point, not after the work is done.',
      'High-risk signals are explicit: authentication and authorization changes, payment flows, PHI data access, schema migrations that could destroy data, and any expansion of the public API surface.',
      'High-risk specs are routed to the hardened harness: security and compliance workers are mandatory, bounded retries are tighter, and a human gate sits before the PR emits.',
      'Low-risk CRUD features go through the fast lane: fewer intermediate gates, auto-approve eligible on passing CI, and a lighter review pass.',
      'This is how the trust ladder collapses selectively. Autonomy expands for low-risk work without relaxing safeguards on high-risk work — the two paths are structurally separate.',
    ],
  },
  orchestration: {
    label: 'Orchestration',
    role: 'Deterministic conductor',
    color: '#E1F5EE',
    border: '#0F6E56',
    text: '#04342C',
    mermaid: `flowchart TB
  spec[/"Feature spec"/] --> validate{"Spec validator · complete + consistent vs existing system"}
  validate -->|"conflict / incomplete"| amend["Back to spec author"]
  amend -.-> spec
  validate -->|valid| plangen["Plan generator"]
  plangen --> approve{"Approve plan; gate before migrate"}
  approve --> migrate["migrate · db_migration · no deps"]
  migrate --> api["api · rest_endpoints · needs migrate"]
  api --> fe["frontend · react_components · needs api"]
  api --> tests["tests · test_suite · needs api + frontend"]
  fe --> tests
  approve --> config["config · feature_flags_and_permissions · no deps"]
  tests --> verify{"Verify gate · CI in loop"}
  config --> verify
  verify -->|fail| retry["Retry bounded then escalate to human"]
  retry -.-> migrate
  verify -->|pass| qa{"QA review · human-in-the-loop"}
  qa -->|sign off| pr[/"Reviewable PR"/]
  qa -->|add cases / reject| tests`,
    details: [
      'Orchestration is deterministic code, not a model — a static DAG with defined stage order, not an agent deciding what to do next. The shape of every run is predictable and inspectable.',
      'The spec compiles into an ordered execution plan: schema migration first, then REST endpoints, then frontend components, then tests. Feature flags and permissions are provisioned in parallel with no dependencies.',
      'Every stage passes an eval gate — a spec-grounded check that the artifact matches the field that requested it — before its output is handed to the next stage. Bad output is caught at the stage boundary, not after all six stages have run.',
      'Artifacts between stages are typed contracts, not prose. The frontend worker receives a typed API contract generated from the migration and endpoint workers, so it can never misread what the API actually exposes.',
      'When a stage fails, the orchestrator retries it a bounded number of times with the failure context injected back into the worker. When retries exhaust, it checkpoints state and escalates to a human with exactly the output and diff that caused the failure.',
    ],
  },
  workers: {
    label: 'Workers',
    role: 'Same model, six harnesses',
    color: '#E1F5EE',
    border: '#0F6E56',
    text: '#04342C',
    mermaid: `flowchart TB
  specslice[/"Spec slice"/] --> worker
  subgraph worker["Harnessed worker · single shared LLM"]
    direction TB
    context["Context · spec + retrieved code"]
    skills["Skills · packaged repeat work"]
    memory["Memory · run state + learned"]
    tools["Tools · scoped per stage"]
  end
  worker --> artifact[/"Generated artifact"/]
  artifact --> evalgate{"Eval gate · checks output vs spec"}
  evalgate -->|pass| nextstage["Next stage in DAG"]
  evalgate -->|fail| human["Retry / human"]`,
    details: [
      'The same underlying model runs in every harness — the model is a swappable commodity. What differs is the context injected, the tools scoped, and the exemplars retrieved. The harness is the product, not the weights.',
      'Build harness generates full-stack feature artifacts per pattern type: CRUD+UI, Integration, Workflow, and Analytics each have a dedicated context pack and exemplar set so output reads like code written by someone who knows the repo.',
      'Migration harness is engine-aware (Postgres, MongoDB, DynamoDB, Redis) and enforces rollback safety and zero-downtime by construction — every generated migration is checked against the migration linter before it leaves the worker.',
      'Integration harness handles external API connections with retry/backoff, circuit breakers, and idempotency keys as non-optional scaffolding. Workers cannot generate an integration without them.',
      'Security worker is adversarial and read-only — its success criterion is finding vulnerabilities in what the build workers produced, not confirming that things look reasonable. It runs independently to avoid approving its own output.',
      'Compliance worker confirms required controls are present: audit logging on every mutation, Vault refs in place of raw credentials, permission gates on every endpoint, and correct PHI classifications.',
      'Performance harness is adversarial to latency: it scans generated queries for N+1 patterns, checks for missing indexes on join columns, and flags any hot-path without a cache strategy.',
    ],
  },
  verification: {
    label: 'Verification',
    role: 'Defense in depth',
    color: '#E1F5EE',
    border: '#0F6E56',
    text: '#04342C',
    mermaid: `flowchart TB
  artifact[/"Stage artifact"/] --> checks["Per-stage checks · compile · lint · typecheck"]
  checks --> conform["Pattern conformance · LLM judge + static vs exemplar"]
  conform --> sec["Security policy gate · deterministic floor: SAST, migration linter, OPA"]
  sec --> ui["UI verification · browser + screenshot, frontend stage"]
  ui --> tests["Spec-derived tests · from acceptance, not implementation"]
  tests --> ci{"Real CI in loop · green?"}
  ci -->|"fail"| retry["Bounded retry, then escalate to human"]
  retry -.-> artifact
  ci -->|"pass"| qa{"Human QA · risk-weighted, live env"}
  qa -->|"sign off"| pr[/"to Review / PR"/]
  qa -->|"add cases / reject"| tests
  classDef stage fill:#E1F5EE,stroke:#0F6E56,color:#04342C
  classDef human fill:#FAEEDA,stroke:#854F0B,color:#412402
  classDef warn fill:#FCEBEB,stroke:#A32D2D,color:#501313
  classDef io fill:#F1EFE8,stroke:#5F5E5A,color:#2C2C2A
  class checks,conform,sec,ui,tests stage
  class artifact,pr io
  class qa human
  class retry warn`,
    details: [
      'Verification is woven into every stage, not bolted on at the end. A build worker that produces a syntactically valid artifact but semantically wrong one is caught at its own stage boundary, not after five more stages have run on top of it.',
      'Cheap checks run first at every stage boundary: compile, lint, and typecheck catch the obvious before anything expensive is invoked.',
      'Pattern conformance checks use an LLM judge plus static analysis against the retrieved exemplar from Codebase Intelligence — so generated code is evaluated against what this specific codebase considers canonical, not a generic rubric.',
      'Security and compliance workers run before CI. Their findings are blocking: a security finding or missing control stops the pipeline and sends the work back to the orchestrator with the specific violation attached.',
      'Tests are generated from acceptance criteria in the spec, not from the implementation. This means the test suite verifies the spec was met, not that the implementation is internally consistent with itself.',
      'Real CI runs in the loop — the factory spins up the actual test suite, not a simulation. Green CI is a prerequisite for the PR emitting, not something checked after the fact.',
      'Human QA is risk-weighted and runs in a live environment. The QA reviewer signs off on the acceptance criteria from the spec, not just on code appearance.',
    ],
  },
  review: {
    label: 'Review',
    role: 'Human-in-the-loop',
    color: '#E1F5EE',
    border: '#0F6E56',
    text: '#04342C',
    mermaid: `flowchart TB
  assembled[/"Assembled change + generation report"/] --> router{"Risk router · by blast radius"}
  router -->|"low-risk CRUD"| light["Light review · clean diff + provenance"]
  router -->|"auth / payments / migrations / regulated"| redteam["Red-team agent · adversarial pass"]
  redteam --> mandatory["Mandatory human review"]
  light --> human{"Human gate · approve / correct / re-run"}
  mandatory --> human
  human -->|"approve"| pr[/"Reviewable PR"/]
  human -.->|"re-run"| factory["Back through factory"]
  classDef stage fill:#E1F5EE,stroke:#0F6E56,color:#04342C
  classDef human fill:#FAEEDA,stroke:#854F0B,color:#412402
  classDef warn fill:#FCEBEB,stroke:#A32D2D,color:#501313
  classDef io fill:#F1EFE8,stroke:#5F5E5A,color:#2C2C2A
  class light,factory stage
  class redteam warn
  class mandatory,human human
  class assembled,pr io`,
    details: [
      'Progressive disclosure — engineers are invited to intervene at every stage gate, not just when a finished PR lands. A bad spec is caught before generation; a bad plan is caught before migration; a bad migration is caught before the API is built on top of it.',
      'High-risk output goes through a red-team agent first: an adversarial pass that actively constructs failure scenarios and attack vectors before any human looks at the diff.',
      'The PR carries full provenance. Every generated file is annotated with the spec field that requested it and the name of the human who approved it. The generation report is the audit trail, not a log file no one reads.',
      'The diff is reviewable as a clean, minimal change. Engineers see what changed and why — what exemplar was matched, what pattern was applied — without having to reverse-engineer the reasoning from the output.',
      'The trust ladder is evidence-gated, not time-gated. As pass rates accumulate and failure modes are understood, gates collapse for specific risk tiers and patterns. The gate structure reflects actual reliability data, not a calendar.',
    ],
  },
  pr: {
    label: 'PR',
    role: 'Deployable output',
    color: '#F1EFE8',
    border: '#5F5E5A',
    text: '#2C2C2A',
    details: [
      'The output is a reviewable, deployable pull request spanning the full stack: migration, API endpoints, frontend components, tests, feature flags, and permissions — all in one coherent change.',
      'Every file in the PR is annotated with its originating spec field and the name of the approver who authorized it. Nothing in the diff is unexplained.',
      'The factory is calibrated to pass CI on first run 80% of the time. When it does not, the bounded retry loop is responsible — the PR never emits with a failing test suite.',
      'The human cleanup budget is 30 minutes or less. If an engineer spends more than that getting a factory PR into shape, that is a factory failure, not an engineering task — it gets triaged back as a reliability signal.',
      'The spec, generation traces, and approval chain together satisfy SOC 2 CC8.1 (change management) and HIPAA §164.312(b) (audit controls) without requiring separate documentation.',
    ],
  },
  intel: {
    label: 'Codebase Intelligence',
    role: 'Context engine',
    color: '#EEEDFE',
    border: '#534AB7',
    text: '#26215C',
    mermaid: `flowchart TB
  repos[/"Seven repos · three languages"/] --> indexer["Indexer · language parsers feed one unified schema"]
  indexer --> struct[("Structural index · symbol + dependency graph")]
  indexer --> exemplar[("Exemplar store · canonical pattern per repo + engine")]
  indexer --> facts[("Architectural facts · Vault, permissions, audit, tables")]
  indexer --> profile[("Product profiles · stable conventions, per-product prompt")]
  struct --> retrieval{{"Retrieval · hybrid: semantic + graph + exemplar"}}
  exemplar --> retrieval
  facts --> retrieval
  profile --> retrieval
  retrieval -->|context| consumers[/"Spec validator · Plan generator · Workers"/]
  merge["Merge to a repo"] -.->|"re-index hook"| indexer
  learn[["Learning loop"]] -.->|exemplars| exemplar
  classDef proc fill:#E1F5EE,stroke:#0F6E56,color:#04342C
  classDef store fill:#EEEDFE,stroke:#534AB7,color:#26215C
  classDef io fill:#F1EFE8,stroke:#5F5E5A,color:#2C2C2A
  class indexer,retrieval proc
  class struct,exemplar,facts,profile,learn store
  class repos,consumers,merge io`,
    details: [
      'Indexes seven repos across three languages (TypeScript, Python, Go), four DB engines (Postgres, MongoDB, DynamoDB, Redis), and two frontend frameworks — one unified schema regardless of how heterogeneous the estate is.',
      'Four distinct stores serve different retrieval needs: a structural index for symbol and dependency graph lookups, an exemplar store of canonical pattern implementations, an architectural facts store for Vault refs, permission models, and audit wiring, and per-product profile prompts that encode stable conventions.',
      'The exemplar store is why factory output reads like code a senior engineer wrote for this specific codebase. Every generated artifact is grounded against the canonical implementation of that pattern in that repo, not a generic template.',
      'Retrieval is hybrid: semantic similarity for intent-level matching, structural graph traversal for dependency-aware context, and exemplar lookup for pattern grounding. Each worker gets a context pack assembled from all three rather than a single retrieved chunk.',
      'The index stays current via a re-index hook on every merge. Exemplars are promoted or retired by the Learning Loop as pass rates and acceptance data accumulate — the context workers receive reflects the current state of the codebase, not a stale snapshot.',
    ],
  },
  learn: {
    label: 'Learning Loop',
    mermaid: `flowchart LR
  run["Factory run"] --> traces[("Traces · leading")]
  run --> deploy["Deploy"] --> dora[("Production · DORA")]
  traces --> evals["Eval suite"]
  dora --> evals
  evals --> dash["Dashboard · leading + DORA"]
  evals --> rules["Emergent rules"]
  review["Human QA + review"] --> memory[("Memory + taste")]
  dora -.->|incidents| memory
  rules -.->|"skills, guardrails"| run
  memory -.->|exemplars| run
  dash -.->|gate-collapse| run
  classDef prod fill:#E1F5EE,stroke:#0F6E56,color:#04342C
  classDef learn fill:#EEEDFE,stroke:#534AB7,color:#26215C
  class run,deploy,dora prod
  class traces,evals,dash,rules,memory,review learn`,
    role: 'Self-improvement flywheel',
    color: '#EEEDFE',
    border: '#534AB7',
    text: '#26215C',
    details: [
      'Every factory run is fully traced with OpenTelemetry-style spans on every tool call, model invocation, and stage transition. The trace is not for debugging — it is the primary signal the loop learns from.',
      'Every deploy emits the four DORA metrics: lead time, deployment frequency, change failure rate, and mean time to restore. The factory continuously reproduces the time study that motivated building it, so the ROI claim is always grounded in current data.',
      'Repeated failures are not just retried — they are analyzed. When the same failure pattern recurs across runs, it becomes a new guardrail (a hard block in future worker context) or a new skill (a packaged remedy injected proactively).',
      'Work that passes human QA and gets accepted sharpens the exemplar store. The patterns workers are retrieving and grounding against are continuously updated to reflect what the team has actually accepted, not what was canonical six months ago.',
      'The factory improves without touching the model or retraining anything. Improvement lives in the harness — better exemplars, sharper guardrails, new skills, collapsed gates — all of it is editable code, not black-box weights.',
    ],
  },
  security: {
    label: 'Security Worker',
    role: 'Adversarial reviewer',
    color: '#EEEDFE',
    border: '#534AB7',
    text: '#26215C',
    details: [
      'The Security Worker has an adversarial posture and read-only tools. Its success criterion is finding vulnerabilities in what the build workers produced — not confirming that things look reasonable. A worker that finds nothing is more concerning than one that finds something.',
      'It runs independently of the build workers, with no shared state or context from the generation pass. This prevents the model from rationalizing its own output; it reviews the artifact as a stranger would.',
      'Its context pack includes OWASP Top 10 patterns, Athena-specific compliance controls for HIPAA and SOC 2, and known attack exemplars retrieved from the Codebase Intelligence security facts store.',
      'It checks for permission gates on every endpoint, credential leaks (raw secrets, unvaulted keys), injection surfaces in any endpoint that touches user input, and privilege escalation paths in role assignments.',
      'A finding is a hard block — the PR cannot emit with an open security finding. No finding is a pass, not an absence of evidence. The inverse of a build worker\'s success criterion is exactly the point.',
    ],
  },
  comply: {
    label: 'Compliance Worker',
    role: 'Controls verifier',
    color: '#EEEDFE',
    border: '#534AB7',
    text: '#26215C',
    details: [
      'The Compliance Worker is distinct from the Security Worker in a precise way: the Security Worker finds what is broken, while the Compliance Worker confirms that what is required is actually present. They are complementary, not redundant.',
      'It verifies that audit logging is wired on every state-mutating endpoint — not just present in the codebase, but connected to the specific mutation generated. Vault refs must replace any raw credentials; the check is structural, not grep-based.',
      'Every endpoint must have a permission gate; every PHI data field must carry the correct classification attribute. The compliance worker checks the generated code against the architectural facts store, not against a generic checklist.',
      'The change must be traceable to an approved spec with a named human approver. A generated artifact without a provenance chain fails compliance regardless of whether the code itself is correct.',
      'Mandatory on fintech and healthtech products. The passing condition is a complete checklist — SOC 2 CC8.1 (change management) and HIPAA §164.312(b) (audit controls) — not a judgment call about whether the code looks compliant.',
    ],
  },
};

export const INITIAL_NODES = [
  // Spine — evenly spaced, centred on y=280
  { id: 'spec',          position: { x: 40,   y: 280 }, data: { id: 'spec' },          type: 'factory' },
  { id: 'router',        position: { x: 230,  y: 235 }, data: { id: 'router' },         type: 'diamond' },
  { id: 'orchestration', position: { x: 460,  y: 280 }, data: { id: 'orchestration' },  type: 'factory' },
  { id: 'workers',       position: { x: 700,  y: 280 }, data: { id: 'workers' },         type: 'factory' },
  { id: 'verification',  position: { x: 950,  y: 280 }, data: { id: 'verification' },    type: 'factory' },
  { id: 'review',        position: { x: 1180, y: 280 }, data: { id: 'review' },          type: 'factory' },
  { id: 'pr',            position: { x: 1400, y: 280 }, data: { id: 'pr' },              type: 'factory' },
  // Top flank — Intel offset right of Workers so learn→intel doesn't route left through Spec
  { id: 'intel',         position: { x: 820,  y: 80  }, data: { id: 'intel' },           type: 'factory' },
  // Bottom flank — Learn offset left so learn→intel routes right, not left
  { id: 'learn',         position: { x: 580,  y: 480 }, data: { id: 'learn' },           type: 'factory' },
  { id: 'security',      position: { x: 950,  y: 480 }, data: { id: 'security' },        type: 'factory' },
  { id: 'comply',        position: { x: 1180, y: 480 }, data: { id: 'comply' },          type: 'factory' },
];

const spineArrow = { type: 'arrowclosed', color: '#0F6E56' };
const dotArrow   = { type: 'arrowclosed', color: '#534AB7' };
const gateArrow  = { type: 'arrowclosed', color: '#854F0B' };
const dotStyle   = { stroke: '#534AB7', strokeWidth: 1.5, strokeDasharray: '5 4' };
const dotLabel   = (text) => ({ label: text, labelStyle: { fill: '#534AB7', fontSize: 11 }, labelBgStyle: { fill: '#fbfbfa' } });

export const INITIAL_EDGES = [
  { id: 'e-spec-router',    source: 'spec',         sourceHandle: 'right-source', target: 'router',        targetHandle: 'left-target',  markerEnd: spineArrow, style: { stroke: '#0F6E56', strokeWidth: 2 } },
  { id: 'e-router-orch',    source: 'router',       sourceHandle: 'right-source', target: 'orchestration', targetHandle: 'left-target',  markerEnd: spineArrow, style: { stroke: '#0F6E56', strokeWidth: 2 } },
  { id: 'e-orch-workers',   source: 'orchestration',sourceHandle: 'right-source', target: 'workers',       targetHandle: 'left-target',  markerEnd: spineArrow, style: { stroke: '#0F6E56', strokeWidth: 2 } },
  { id: 'e-workers-verify', source: 'workers',      sourceHandle: 'right-source', target: 'verification',  targetHandle: 'left-target',  markerEnd: spineArrow, style: { stroke: '#0F6E56', strokeWidth: 2 } },
  { id: 'e-verify-review',  source: 'verification', sourceHandle: 'right-source', target: 'review',        targetHandle: 'left-target',  markerEnd: spineArrow, style: { stroke: '#0F6E56', strokeWidth: 2 } },
  { id: 'e-review-pr',      source: 'review',       sourceHandle: 'right-source', target: 'pr',            targetHandle: 'left-target',  markerEnd: spineArrow, style: { stroke: '#0F6E56', strokeWidth: 2 } },
  { id: 'e-intel-orch',     source: 'intel',        target: 'orchestration', markerEnd: dotArrow, style: dotStyle, ...dotLabel('context') },
  { id: 'e-intel-workers',  source: 'intel',        target: 'workers',       markerEnd: dotArrow, style: dotStyle, ...dotLabel('context') },
  { id: 'e-router-workers', source: 'router',       target: 'workers',       markerEnd: gateArrow, style: { stroke: '#854F0B', strokeWidth: 1.5, strokeDasharray: '5 4' }, label: 'harness tier', labelStyle: { fill: '#854F0B', fontSize: 11 }, labelBgStyle: { fill: '#fbfbfa' } },
  { id: 'e-verify-learn',   source: 'verification', target: 'learn',         markerEnd: dotArrow, style: dotStyle, ...dotLabel('traces') },
  { id: 'e-learn-workers',  source: 'learn',        target: 'workers',       markerEnd: dotArrow, style: dotStyle, ...dotLabel('skills, memory') },
  { id: 'e-learn-intel',    source: 'learn',        target: 'intel',         markerEnd: dotArrow, style: dotStyle, ...dotLabel('exemplars') },
  { id: 'e-sec-verify',     source: 'security',     target: 'verification',  markerEnd: dotArrow, style: dotStyle, ...dotLabel('adversarial pass') },
  { id: 'e-comply-verify',  source: 'comply',       target: 'verification',  markerEnd: dotArrow, style: dotStyle, ...dotLabel('controls check') },
];
