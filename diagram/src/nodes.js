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
      'Engineer pastes a brief; the compiler turns it into a typed, schema-validated spec.',
      'Validator gates it: no acceptance criteria, no plan — incomplete specs never reach generation.',
      'Consistency gate checks against the existing codebase — catches conflicts before any code runs.',
      'Human approves the spec; it becomes the versioned audit trail everything traces back to.',
      'One spec = one feature = one PR — batch discipline enforced upstream.',
    ],
  },
  router: {
    label: 'Risk Router',
    role: 'Tier assignment',
    color: '#FAEEDA',
    border: '#854F0B',
    text: '#412402',
    details: [
      'Reads the spec before anything runs and assigns a risk tier.',
      'High-risk signals: auth, payments, PHI, schema migrations, public API surface.',
      'High-risk → hardened harness, security + compliance workers, mandatory human gates.',
      'Low-risk CRUD → fast lane, fewer gates, auto-approve eligible.',
      'This is how the trust ladder collapses selectively — autonomy expands for low-risk without removing safeguards from high-risk.',
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
      'Deterministic code, not a model — a DAG, not a swarm.',
      'Spec compiles into ordered stages: migrate → api → frontend → tests (config in parallel).',
      'Each stage passes an eval gate before feeding the next.',
      'Typed artifacts between stages — frontend gets a typed API contract, not prose.',
      'Failure recovery: per-stage bounded retries, then human escalation with checkpointing.',
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
      'Same underlying model everywhere — the model is a swappable commodity.',
      'Build harness — constructs artifacts per pattern (CRUD+UI, Integration, Workflow, Analytics).',
      'Migration harness — per DB engine (Postgres, MongoDB, DynamoDB, Redis); rollback-safe, zero-downtime enforced.',
      'Integration harness — external APIs, retry/backoff, idempotency keys non-optional.',
      'Security worker — adversarial, read-only; finds vulnerabilities in what build produced.',
      'Compliance worker — confirms required controls are present: audit, Vault, permission gates, PHI classification.',
      'Performance harness — adversarial to latency; finds N+1 queries and missing indexes.',
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
      'Woven in per-stage, not bolted on at the end.',
      'Cheap checks first: compile, lint, typecheck.',
      'Pattern conformance: LLM judge + static checks against the retrieved exemplar.',
      'Security and compliance workers run before CI.',
      'Spec-derived tests generated from acceptance criteria, independent of implementation.',
      'Real CI runs in the loop before the PR emits.',
      'Human QA gate: risk-weighted, live environment, signs off on acceptance criteria.',
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
      'Progressive disclosure — engineers intervene at every stage, not just the end.',
      'High-risk output gets a red-team pass and mandatory human review.',
      'PR carries full provenance: every file traces to a spec field and named approver.',
      'Clean diff + generation report: what was produced, why, and what exemplars were matched.',
      'Trust ladder: as pass rates prove reliability, gates collapse — never on a schedule, always on evidence.',
    ],
  },
  pr: {
    label: 'PR',
    role: 'Deployable output',
    color: '#F1EFE8',
    border: '#5F5E5A',
    text: '#2C2C2A',
    details: [
      'A reviewable, deployable pull request across the full stack.',
      'Every file links to its spec field — the generation report is the audit trail.',
      'Passes CI on first run 80% of the time.',
      'Requires ≤30 minutes of human cleanup — more than that is a factory failure.',
      'Spec + traces + generation report satisfies SOC 2 CC8.1 and HIPAA §164.312(b).',
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
      'Indexes seven repos across three languages, four DB engines, two frontend frameworks.',
      'Four stores: structural index, exemplar store, architectural facts, product profile.',
      'Exemplar store: canonical implementation of each pattern per repo — why output reads native.',
      'Hybrid retrieval: semantic + structural graph + exemplar lookup feeds context to workers.',
      'Stays current via re-index on merge and exemplars graduated by the learning loop.',
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
      'Every run is traced (OpenTelemetry-style spans on every tool call).',
      'Every deploy emits the four DORA outcomes — the factory continuously reproduces the time study.',
      'Repeated failures become guardrails and new skills.',
      'Accepted work sharpens the exemplars retrieval serves.',
      'Factory improves without touching the model — improvement lives in the harness, not the weights.',
    ],
  },
  security: {
    label: 'Security Worker',
    role: 'Adversarial reviewer',
    color: '#EEEDFE',
    border: '#534AB7',
    text: '#26215C',
    details: [
      'Adversarial posture, read-only tools — success = finding vulnerabilities, not validating that things work.',
      'Runs independently of build workers — no bias toward approving its own output.',
      'Context: OWASP top 10, Athena compliance controls (HIPAA/SOC 2), known attack patterns as exemplars.',
      'Checks: permission gates on every endpoint, no credential leaks, no injection surfaces.',
      'A finding blocks the PR; no finding is a pass — the inverse of a build worker\'s success criterion.',
    ],
  },
  comply: {
    label: 'Compliance Worker',
    role: 'Controls verifier',
    color: '#EEEDFE',
    border: '#534AB7',
    text: '#26215C',
    details: [
      'Distinct from security: security finds what\'s broken, compliance confirms what\'s required is present.',
      'Checks: audit logging wired on every mutation, Vault refs used (never raw credentials), permission gate on every endpoint.',
      'PHI data classifications correct; change traces to approved spec with named approver.',
      'Mandatory on fintech and healthtech products — SOC 2 CC8.1 and HIPAA §164.312(b).',
      'Passes by confirming the checklist is complete; fails by finding a missing control.',
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
