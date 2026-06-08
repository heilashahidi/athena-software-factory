## Building Your Own Software Factory - Eric Zakariasson, Cursor

Eric Zakariasson argues that agentic software work is moving from **pair-programming** toward **managed production systems**: developers increasingly define intent, constraints, feedback loops, and verification rather than writing every line themselves. Cursor is not fully at the "software factory" stage yet, but parts of its product and company already run with high autonomy, offering practical lessons for teams trying to build similar systems.

### The Autonomy Ladder

The talk frames AI coding progress as a climb through levels of autonomy:

- **Autocomplete**: the earliest Cursor-style experience, where AI accelerates local coding.
- **Pair programmer**: the common current state, where humans ask questions, request changes, and review suggestions.
- **AI-generated majority code**: the human increasingly reviews traces, outputs, and implementation quality.
- **Delegated agent work**: the human scopes tasks, launches agents, and inspects outcomes.
- **Software factory**: agents plan, build, test, review, and ship inside a managed system.

> "You as a manager just provides like the intent"

The reason to build such a factory is **throughput**, **consistency**, and **leverage**. Agents can run continuously, handle parallel work, and turn a person's taste or product judgement into more shipped output. But without structure, agents feel probabilistic and unreliable; that is a signal to add better **guardrails**, **verification**, and **operational discipline**.

### What the Factory Needs

Zakariasson breaks the factory into **primitives, guardrails, and enablers**.

**Primitives and patterns** make a codebase legible to agents:

- Modular, co-located code helps agents discover the relevant files quickly.
- Familiar conventions such as `package.json`, startup scripts, test commands, and standard service patterns reduce exploration cost.
- Existing examples matter: agents are completion machines, so they tend to continue the patterns already present.

**Guardrails** constrain risk:

- Sensitive areas such as authentication, encryption, payments, and data migrations may need explicit restrictions or mandatory human review.
- Rules should not be blindly installed from templates. They should **emerge dynamically** when agents repeatedly make the same mistake.
- Tests are central because agents need to know whether they broke something.

> "rules should just like emerge dynamically"

**Enablers** give agents useful capabilities:

- Skills, MCPs, and integrations let agents access context from tools such as Linear, Notion, Datadog, Slack, GitHub, and internal systems.
- Feature-flagging skills let agents ship changes behind flags and return with a safe trial path.
- Reproducible environments let agents start projects, run services, and verify their own changes without a human babysitting setup.

The key checklist is: **is it runnable, accessible, and verifiable?** Backend systems are often easier because contracts are clearer; UI systems require agents to click through flows, inspect states, and check visual output.

### Running Agents Means Becoming a Manager

Once the basic factory exists, the human role changes. The developer becomes less of a line-by-line worker and more of a **manager of asynchronous execution**.

That shift requires:

- **Scoping work cleanly** so agents do not collide in the same files.
- **Parallelising intentionally**: one unit of work can be one agent, but overlapping work creates merge conflicts and confusion.
- **Front-loading context** through plans, specs, examples, and constraints.
- **Preserving tribal knowledge**: humans still need to understand data flow, critical paths, user needs, and where mistakes are costly.
- **Reviewing outputs before code**: videos, screenshots, traces, test results, and PR summaries become more important.

Zakariasson recommends isolated environments for serious parallelism. Git worktrees can help, but databases, caches, user state, and services also need isolation. Cursor's cloud agents solve this by giving each agent a VM; Cursor Workers aim to bring similar orchestration to self-hosted machines.

> "I'm always using isolated environments"

A mature factory also needs observability. Teams should detect agents that loop, run too long, touch no files, request irrelevant permissions, or fail to make progress.

### Scaling the Factory

Scaling from a few agents to dozens or hundreds depends less on prompting tricks and more on **systems that improve themselves**.

Examples from Cursor include:

- **Daily review automation**: summarising Slack and GitHub activity.
- **Merged PR comment analysis**: learning from high-signal human review comments.
- **Agentic code owners**: estimating PR risk, approving low-risk changes, and pulling in relevant humans for high-risk ones.
- **Continual learning plugins**: extracting repeated corrections from agent transcripts and turning them into rules or memories.
- **Automated stale feature-flag cleanup**: Linear tickets trigger cloud agents once flags are fully rolled out.

The broader pattern is to inspect repetitive human-in-the-loop actions and automate them away. If a developer repeatedly copies logs, triages Slack feedback, checks GitHub comments, or writes the same prompt, that is a candidate for a factory component.

> "store context for later"

The factory must also retain examples of good work: agent transcripts, screenshots, accepted artefacts, design system references, and human review decisions. These become the memory and taste layer that helps future agents behave more consistently.

### Risks, Teams, and Organisational Change

The Q&A focuses on where the factory model gets hard.

**Architecture quality** remains a human responsibility. Agents may optimise for task completion rather than long-term design, so teams need architectural reviews, refactoring passes, and examples that demonstrate the desired patterns.

**Enterprise and mission-critical systems** need stricter practices:

- More human review in critical areas.
- Stronger tests for invariants.
- Security-focused automations.
- Red-team style agent review before humans engage.
- Clear accountability: humans cannot blame agents for shipped failures.

**Rules can fragment teams** if every engineer builds a private factory. Zakariasson suggests treating factory design like code design: discuss it, review it, and decide which rules, tools, and guardrails belong to the shared system.

**Product hand-offs change too.** PMs can create high-fidelity prototypes, but those should often be treated as intent artefacts, not production foundations. Engineers may be better served by a clear interactive prototype than by a prototype that must be painfully migrated from the wrong stack.

**Future roles** move toward product, architecture, orchestration, and systems design. Engineers write and read less code, but they become responsible for direction, taste, scaffolding, evaluation, and agent team design.

### TL;DR

The "software factory" is not just many coding agents; it is a managed system of **clear intent, isolated execution, reusable patterns, guardrails, verification, memory, and observability**. The human role shifts from writing code to designing and supervising the production system that lets agents work safely at scale.

### Actionable Insights

- Build a codebase agents can understand: standard scripts, clear modules, examples, and colocated files.
- Add rules only when real agent failures reveal the need.
- Invest first in verification: tests, UI automation, screenshots, review bots, and risk checks.
- Run parallel agents in isolated environments when work touches services, databases, or state.
- Store high-signal context from reviews, transcripts, accepted designs, and repeated corrections.
- Treat factory design as shared team infrastructure, not a private productivity hack.