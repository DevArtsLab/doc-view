# Purpose and platform doctrine

This foundation defines the shared base that every DevArts Lab project
inherits, so that quality, compliance, and operability are properties of the
platform rather than of individual diligence.

It provides:

- One architecture model that scales from a single landing page to a
  multi-client agentic platform without a rewrite (Section 5 tiers).
- One local development loop that runs the same runtime as production.
- One agent orchestration layer that runs lab operations and assists client
  delivery end to end (Section 15).
- One set of guardrails and governance rules applied uniformly (Sections 10,
  11, 14).
- One repository layout and documentation set (Section 16).
- One cost and capacity model so proposals and estimates are grounded
  (Sections 12, 13).

It does not provide code, templates, or configuration. Those live in the
scaffold repository that implements this plan (roadmap Phase 5).

### 1.1 What "Cloudflare-native" means here

Production runs on Cloudflare's developer platform. The deciding factors
behind this choice, in order:

1. Runtime parity: `wrangler dev` and Miniflare execute the same `workerd`
   runtime that production uses, so local behavior is representative rather
   than approximated.
2. Bindings as the integration layer: storage, queues, AI, and secrets are
   reached through configuration-declared bindings instead of SDK clients and
   connection strings, which removes a class of environment drift.
3. A complete primitive set: compute, static assets, SQL, KV, object storage,
   coordination (Durable Objects), queues, durable workflows, agents,
   inference, gateway, sandboxing, multi-tenant dispatch, secrets, logs, and
   CI/CD exist in one account with one billing relationship.
4. Cost shape: a Workers Paid subscription starts at USD 5 per month with
   generous included usage and no egress or bandwidth charges (Section 12).

The trade-offs accepted with this choice are listed in Section 18.

### 1.2 Platform doctrine: defaults are revisable

Cloudflare-native is the lab's default for hosted production work. It is a
default, not a boundary. The lab is not restricted to Cloudflare, or to any
named platform, framework, or agent runtime, and this plan is the operating
system for choosing tools rather than a mandate for one stack.

Rules that keep flexibility honest:

- Every engagement selects tools on evidence, not habit. The deciding
  requirement is written down before the tool is named; this is the same
  pattern used throughout Section 4.
- Section 4 is the research catalog for the Cloudflare platform. When the
  lab adopts a second platform at decision grade (Neuro-SAN for self-hosted
  agent runtime, n8n for client workflow automation, Docker Compose for
  product distribution), it earns a parallel catalog section with the same
  discipline: verified facts, limits, cost shape, deciding requirements.
- A platform enters the plan through a defined path: living research
  ticket, then a decision record, then a catalog entry. It never enters by
  silent adoption.
- The delivery lifecycle in Section 8 is stack-agnostic. Research, Design,
  Development, Launch, and Operate phases, their artifacts, and their
  approval gates hold whether the runtime is Workers, containers, a user's
  machine, or a client-managed service.
- Deviation is cheap when it is recorded. An engagement that picks a
  non-default platform files one ADR naming the deciding requirement and
  the exit or fallback path; nothing else changes.
- The discipline that does not flex: Linear is the system of record,
  secrets never touch repositories, documents are the interface between
  humans and agents, and nothing falls back silently (Principle 13). These
  hold under any stack.

The result is one SDLC with a preferred spine, not a walled garden: the
plan navigates to the best tool for the requirement at hand and records
why, so the next engagement inherits the research rather than repeating it.
