# Agent orchestration model

### 15.1 Two agent populations

| Population     | Purpose                                                           | Runtime                                                                                       | Examples                                                       |
| -------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Lab operations | Run the lab: intake, research, estimates, indexes, Linear hygiene | Agents SDK on lab Workers; local CLI agents (Devin, Claude Code) for repository work          | Intake agent, research agent, index regenerator, cost reviewer |
| Delivery       | Assist client projects end to end                                 | Agents SDK inside the project (T2) or lab-owned agents acting on client repos                 | Scaffold agent, migration agent, QA agent, runbook writer      |
| Public-facing  | Serve external visitors on lab and client surfaces                | Agents SDK Durable Object per visitor session; thin channel Workers as ingress (Section 15.6) | devartslab.com concierge, client site assistants               |

### 15.2 Shared contracts

- Every agent has a written card in `docs/agents/<name>.md`: owner (named
  person), purpose, tools (MCP servers and scopes), limits (steps, seconds,
  spend), shutoff (mechanism and procedure), state schema, resolution
  domains it may handle autonomously (15.7), approval points, check method
  (evals or verification), audit events, failure modes.
- Agents never hold the only copy of state (Principle 3).
- Agents reach external systems only through MCP servers or bindings;
  never through ad hoc HTTP with embedded credentials.
- Human approval is mandatory for: phase transitions, client-visible
  outputs, spend above a per-project threshold, deletion of any data class
  above internal, and production deploys.

### 15.3 Work tracking

Linear is the system of record for activity (lab rule). Every agent run that
changes a repository or a deployment creates or updates a Linear issue; the
Delivery Workflow mirrors its phase into the issue state. GitHub Issues are
not used.

### 15.4 Optional: cagent for local agent prototyping

cagent is Docker's agent builder and runtime: YAML-defined agents with MCP
tool support, running locally. It fits development-time prototyping of agent
flows and tool sets. It does not fit production; the production runtime is
the Agents SDK on Durable Objects. Treat cagent definitions as design
artifacts that inform the agent card, not as deployable units. Adoption is
optional per project.

Repository: <https://github.com/docker/docker-agent> (formerly
`docker/cagent`; the old URL redirects).

### 15.5 Agent-facing conventions in every repository

- `AGENTS.md` at the repository root states how agents should work in the
  repo: commands, verification steps, forbidden actions, Linear tracking.
- `REPO_INDEX.md` lists what lives where and is regenerated on change.
- `docs/` holds the plan, ADRs, agent cards, governance register, runbooks.
- Agents working a documentation corpus in the research stage follow the
  serial-code convention: one spec file per agent (`RESEARCH-###.md` or an
  equivalent prefix) plus a status registry (proposed, active, paused,
  done, retired) updated on every run; the registry carries into
  development. The waykeeper `research/AGENTS.md` is the worked example.
- Skills resolve by name from the user-global skills directory
  (`$AGENT_CONFIG_HOME/skills/`), never by vendoring copies into repositories. A
  repository declares the skills it needs in `AGENTS.md`. Installed copies
  under tool-specific directories (for example `~/.claude/skills/`) are
  generated downstream artifacts, not a second source of truth, and drift
  between them is checked, not assumed away. A repository that must be
  self-contained distributes its skills through a registry, not through a
  copied file.

### 15.6 Public-facing agents

The third population: agents that serve external, unauthenticated visitors
on lab and client surfaces. The channel-agnostic-core rule applies: the
agent holds instructions, tools, state, and evals; each channel is a thin
ingress that verifies, normalizes, and forwards.

- One Agents SDK Durable Object per visitor session (D2 option A). Session
  identity comes from a first-party cookie minted on first contact;
  channel adapters map external thread IDs (SMS sender, Slack thread,
  email address) to DO names.
- Channels are thin Workers or routes on an existing Worker: verify the
  channel signature, normalize the message, forward to the DO, relay the
  reply. Adding a channel never touches the agent core.
- Inference routes through AI Gateway per D15 and Section 4.4: spend
  limits, rate limiting, Guardrails, logging. The model identifier is a
  runtime-selectable value administered through the lab interface
  (Section 23.5); no model name is committed to plans, code, or
  repository config.
- Unauthenticated ingress controls: input length caps, per-session message
  and token caps, Turnstile on anonymous endpoints when abuse warrants it,
  agent context restricted to public information only.
- Approval under 15.2 applies to outbound side effects (emails sent,
  tickets filed, purchases); answering questions needs none.
- Every public-facing agent gets an agent card (15.2) and its own threat
  rows under Section 14. First implementation: the devartslab.com
  concierge in devartslab-site (DEV-133).

### 15.7 Escalation contract

Support resolution runs as a control plane, not a prompt instruction. Every
agent card declares the resolution domains it may handle autonomously;
anything outside them escalates by contract, never by improvisation.

- Resolution domains: `SEC_TRUST`, `LEGAL_COMP`, `TECH_ENG`, `VENDOR_OPS`,
  `FIN_BILLING`, `HR_INTERNAL`.
- Routing priority: `SEC_TRUST` and `LEGAL_COMP` first, then `TECH_ENG`,
  `VENDOR_OPS`, `FIN_BILLING`, `HR_INTERNAL`. A technical defect causing a
  downstream error routes to `TECH_ENG` first; dependent domains are
  flagged as follow-on tasks.
- Each domain routes to a named director role, never a person literal
  (Principle 12). In a one-person lab every role resolves to the owner; as
  departments form, a role resolves to a director or to a deterministic
  department agent governed by this same card contract.
- Escalation payload: `resolution_domain`, `severity`
  (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`), `operational_blocker` (why the
  agent's own authority ends), `evidence` (logs, transaction IDs,
  reproduction context gathered before escalation).
- The system of record is Linear: an escalation creates or updates an
  issue with the matching Track and Domain labels; `SEC_TRUST`
  escalations also carry the `Incident` label (per the incident
  convention in `guides/a6-recovery-path.md`).
- After escalating, the agent records the escalation in durable state and
  halts that line of work: no Tier 1 retries, no workarounds, no
  acknowledgment of liability.
- User-facing communication states which domain owns the issue and the
  issue key as reference; internal routing codes and gate rules are never
  exposed.
- Context passed downstream is sanitized and minimal: only the diagnostic
  evidence the receiving role needs.
