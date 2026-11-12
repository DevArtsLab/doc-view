# foundation INDEX

Typed document store. One home per fact; cite by ID or path, never restate.

## decisions/

Rules that bind projects. `D##` = foundation decisions; `LAB-ADR-*` = lab-wide ADRs; `principles`, `excluded`.

## concepts/

Why the system is this way: `doctrine`, `agent-model`, `config-model`, app threat model (`threat-model-agentic-apps`), lab baseline (`threat-model-lab`).

## reference/

Facts and contracts: catalog, tiers, limits, cost, guardrails, layouts, contracts, registers, glossary, open questions, risks, roadmap, market signals, audit events, admin interface, policies, component sources, upstream resource register (`upstream-sources.yaml`; cite as `upstream:<id>`).

## guides/

Procedures: `project-start`, `predevelopment`, `adr-template`, `a6-recovery-path`, `security-txt`.

## Rules

- New fact -> exactly one file. Link it; do not paraphrase it.
- Decision change -> edit its `D##`/ADR file; supersede, do not fork.
- `Section N` and `D##` are stable IDs; use them as references.
- Re-verify decaying facts per `reference/research-policy.md`; log passes in `../research/foundation/source-verification-log.md`.

## Section map (legacy monolith IDs -> files)

- S2 `reference/research-policy`; S3 `decisions/principles`; S4 `reference/cloudflare-catalog`
- S5 `reference/architecture-tiers`; S6-7 `reference/environment-model`; S8 `reference/delivery-lifecycle`
- S9 `decisions/D01`-`D15`; S10 `reference/guardrails`; S11 `reference/data-governance`
- S12 `reference/cost-model`; S13 `reference/limits`; S14 `concepts/threat-model-agentic-apps`
- S15 `concepts/agent-model`; S16 `reference/repo-layout`; S17 `reference/roadmap`
- S18 `reference/risks`; S19 `decisions/excluded`; S20 `reference/open-questions`
- S21 `reference/glossary`; S22 `reference/source-register`; S23 `reference/admin-interface`
- App A `guides/adr-template`; App B `reference/audit-events`; App C `guides/project-start`
- CONFIG-AND-SECRETS S1-2 `concepts/config-model`; S3 `reference/config-principles`; S4 `reference/store-layout`; S5 `reference/resolution-contract`; S6 `reference/protection-at-rest`; S7-8 `reference/secrets-tiers`; S9 `reference/platform-inventory`; S10 `reference/config-open-questions`
