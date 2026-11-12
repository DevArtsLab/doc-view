# Cloudflare product catalog by concern

This section is the research core. Each concern lists the products that
serve it, the deciding requirement between them, maturity and plan notes,
and the lab default. Numbers are summarized in Section 13 and sourced in
Section 22.

### 4.1 Compute and request handling

| Product               | Role                                                           | Notes (verified 2026-11-01)                                                                                                                         |
| --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workers               | HTTP handlers, APIs, webhooks, scheduled jobs, queue consumers | 128 MB memory per isolate; CPU 30 s default, configurable to 5 min on Paid; 10,000 subrequests per request on Paid; 500 Workers per account on Paid |
| Workers Static Assets | Serve frontend files from the same Worker                      | Requests to static assets are free and unlimited; 100,000 files per version on Paid; 25 MiB per file                                                |
| Cron Triggers         | Scheduled invocations                                          | 250 per account on Paid; 15 min wall time; CPU 30 s under 1-hour intervals, 15 min at 1-hour or longer; combine with Queues or Workflows for the work itself |
| Smart Placement       | Run the Worker near its backends rather than the user          | Use when a Worker makes several round trips to one region (Hyperdrive, external API)                                                                |
| Snippets and Rules    | Small edge transforms without a Worker                         | Prefer Rules for redirects and header rewrites; keep application logic in Workers                                                                   |
| Pages                 | Legacy static hosting                                          | Not for new projects; Workers with Static Assets is the recommendation; preserve existing Pages during maintenance only                             |

Deciding requirement: anything that is application logic runs in a Worker.
Static files ride along as Static Assets. Pages is excluded for new work.

### 4.2 Storage and data

Cloudflare publishes a storage selection guide; the lab condenses it into
the following decision matrix.

| Need                                                      | Product                                   | Deciding requirement                                                                             | Key constraints                                                                                                                                                                      |
| --------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Relational application data, SQL, cross-entity queries    | D1                                        | Read-heavy, globally read, lightweight RDBMS without ops                                         | 10 GB per database (not raisable); single-threaded per database; 1,000,000 databases per account on Paid (100,000 included, 0.10 per month each above); read replication available; Time Travel 30 days on Paid; query results over 50 MB fail from 2026-11-04 |
| Per-entity state with strict consistency and coordination | Durable Objects (SQLite)                  | Coordination atom per tenant, session, room, or agent; transactional storage; WebSockets; alarms | 10 GB per object; unlimited objects; soft limit about 1,000 requests per second per object; 500 classes per account on Paid                                                          |
| Configuration, routing metadata, sessions, feature data   | Workers KV                                | Read-heavy, eventually consistent, hot keys served from cache in roughly 0.5 to 10 ms            | 1 write per second per key; not for counters or anything needing immediate consistency                                                                                               |
| Files, uploads, artifacts, exports, logs                  | R2                                        | Object storage, S3-compatible, no egress fees, per-object strong consistency                     | Pair with D1 for searchable metadata; no S3-style object versioning (as of 2026-10-29); retain prior versions under distinct keys or a D1 index                                      |
| Existing Postgres or MySQL                                | Hyperdrive                                | Keep an existing database or need single databases above D1's ceiling                            | Connection pooling and caching from Workers; works with Neon, Supabase, PlanetScale                                                                                                  |
| Semantic search, embeddings                               | Vectorize                                 | Custom retrieval with control over embeddings and indexes                                        | Pair with Workers AI embeddings; use AI Search when a managed RAG pipeline is enough                                                                                                 |
| Custom usage metrics, tenant metering                     | Analytics Engine                          | High-cardinality time series written from Workers, queried by SQL                                | Natural fit for per-client metering (open question Q1)                                                                                                                               |
| Durable event log with independent readers                | K2 Streams                                | Replayable events, multiple consumers, archival                                                  | Newer product; verify availability before promising it                                                                                                                               |
| Streaming ingestion into analytics tables                 | Basin Pipelines, Basin Catalog, Basin SQL | Clickstream, telemetry into Iceberg tables in R2                                                 | Formerly Pipelines, R2 Data Catalog, R2 SQL                                                                                                                                          |
| Versioned file trees, agent checkpoints                   | Artifacts                                 | Git-compatible versioned storage                                                                 | Closed beta; do not depend on it in client commitments                                                                                                                               |

Lab guidance:

- Start every project with D1 for relational data and one Durable Object
  class per coordination atom. Add R2 the moment files or large artifacts
  appear. Add KV only for read-heavy configuration or sessions.
- Design D1 schemas for horizontal split from day one: per-tenant or
  per-domain databases are cheap (100,000 databases included per account,
  0.10 per month each above; usage and storage billed separately), and 10 GB
  per database is a hard ceiling. Paginate large result sets: query results
  over 50 MB fail from 2026-11-04.
- Use `batch()` for D1 throughput; per-request overhead, not query time,
  is usually the throughput limiter.
- Treat Durable Object storage as the system of record for anything an
  agent session mutates (Section 9, D2), and D1 as the system of record for
  cross-entity reporting.

### 4.3 Coordination, asynchronous work, and durable execution

| Product         | Role                                                               | When to choose                                                                                        | Constraints                                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Durable Objects | Single-threaded coordination with transactional storage and alarms | Shared state per entity, WebSockets, ordering, scheduled per-entity work                              | One alarm per object (set replaces existing); alarm handler 15 min wall; do not build one global object                                                                                                                                                                                                                                                                          |
| Queues          | Decouple producers and consumers; absorb bursts                    | Background jobs, fan-out, retries with backoff, dead-letter handling                                  | 128 KB message; 100 retries; batch up to 100; 5,000 messages per second per queue; retention up to 14 days; 25 GB backlog; consumer 15 min wall; 250 concurrent push consumers                                                                                                                                                                                                   |
| Workflows       | Durable multi-step execution with retries, sleeps, events          | Business processes that must resume after failure: delivery pipeline, onboarding, approvals           | 1 MiB per step result and event payload; 1 GB persisted state per instance on Paid; 10,000 steps default (25,000 max); `step.sleep` up to 365 days; completed state retention 7-day default on Paid for Workflows created on or after 2026-09-10 (30-day max, set via `retention`; 3 days Free); bindings attachable to Workers for Platforms user Workers (verified 2026-10-29) |
| Agents SDK      | Durable Object based agent runtime                                 | Stateful agents with RPC, scheduling, built-in queue, retries, `AgentWorkflow`, MCP client and server | Requires `nodejs_compat`; each agent class is its own DO binding plus SQLite migration                                                                                                                                                                                                                                                                                           |
| Cron Triggers   | Time-based entry points                                            | Scheduled kick-off of Queues or Workflows                                                             | Keep the cron handler thin; the work belongs to a Workflow or queue consumer                                                                                                                                                                                                                                                                                                     |

Design rule: Queues for "do this later, maybe many times"; Workflows for
"do these steps in order and survive failure"; Durable Objects for "keep
this entity consistent"; Agents SDK when the entity is an agent session.

Workflows detail that shapes the lab's lifecycle model (Section 8):

- Steps are the persistence and retry boundary. A step's return value is
  stored and replayed; side effects inside a step can run twice, so external
  writes must be idempotent.
- Waiting instances (sleeping, waiting for an event, awaiting retry) do not
  count toward concurrency, so long approval waits are cheap.
- Large outputs belong in R2 with a reference returned from the step.
- Completed instance state retention defaults to 7 days on Paid for
  Workflows created on or after 2026-09-10 (30-day maximum; `default_retention`
  on the binding or `retention` per instance; 3 days on Free); durable records
  must be exported to D1 or R2 before expiry (Section 11).

### 4.4 AI layer: inference, gateway, agents, tools

| Product        | Role                                                                                 | Capabilities relied on by this plan (verified 2026-10-27)                                                                                                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Gateway     | Control plane for every model call                                                   | Caching, rate limiting, spend limits, Guardrails (content policy), DLP (sensitive data detection), BYOK provider keys, Unified Billing with Zero Data Retention option, logging with payload storage controls, Logpush, custom metadata, custom costs, dynamic routing (fallbacks, conditional routes, traffic splits)                                                                    |
| Workers AI     | Managed inference on Cloudflare GPUs                                                 | Text generation, embeddings, image, speech; bound through `ai` binding; route through AI Gateway                                                                                                                                                                                                                                                                                          |
| Agents SDK     | Agent runtime on Durable Objects                                                     | Persistent SQLite-backed state synced to clients, `@callable` RPC, scheduling (delay, cron, interval), `AgentWorkflow`, `runFiber` and `stash` for durable execution, built-in FIFO queue, retries with backoff, MCP client and server, email channel, chat agents with resumable streaming, human-in-the-loop approvals, diagnostics-channel observability, webhooks, push notifications |
| MCP on Workers | Tool exposure to agents                                                              | `createMcpHandler` servers over Streamable HTTP (SSE deprecated in the MCP spec); OAuth-secured servers; least-privilege tool scopes                                                                                                                                                                                                                                                      |
| AI Search      | Managed RAG                                                                          | Use before building Vectorize pipelines when the requirement is "answers over our content"                                                                                                                                                                                                                                                                                                |
| Flagship       | Feature flags with targeting and percentage rollouts (public beta; OpenFeature SDKs) | Gate agent capabilities and client-visible features independently of deploys                                                                                                                                                                                                                                                                                                              |
| Browser Run    | Headless browser automation                                                          | Research-phase scraping, screenshots, rendered extraction; formerly Browser Rendering                                                                                                                                                                                                                                                                                                     |

Notes that affect design:

- AI Gateway's `/compat` endpoint is deprecated for
  single-model calls. Dynamic routes can still be invoked through it for
  existing integrations, but new integrations should use the REST API
  (`/ai/v1/chat/completions`) or the `ai` binding; the Universal Endpoint is
  deprecated outright.
- Gateway authentication and upstream provider credentials are separate
  concerns; provider keys belong in Secrets Store or BYOK, never in Worker
  variables.
- Agents SDK marks Voice, Browser tools, Think, and Code Mode as
  experimental; treat them as research spikes, not client commitments.

### 4.5 Executing generated or untrusted code

Cloudflare offers two sandbox environments, both reached through a Worker
(available on Workers Paid):

| Environment              | What it is                                                                                                                                         | Choose when                                                                                                   | Controls (verified 2026-10-27)                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dynamic Workers          | A Worker spawned at runtime from supplied JavaScript, Python (needs `python_workers` flag), or Wasm via a Worker Loader binding (`worker_loaders`) | Code only needs to call methods your Worker exposes; one-shot evaluation (Code Mode) or cached-by-id modules  | `globalOutbound: null` blocks all egress; explicit binding allow-list; isolate-level separation; 4 concurrent per request, 10 per Durable Object |
| Containers (Sandbox SDK) | A microVM with its own kernel and network, started from an image by a Durable Object                                                               | Code needs Linux, a shell, a filesystem, long-running processes, or coding agents (Claude Code, Codex, Devin) | `enableInternet: false`; credentials stay in the Worker; R2 mounts for workspaces; snapshots                                                     |

Rules:

- Generated code never runs inline in a request handler.
- Default to Dynamic Workers; escalate to Containers only when Linux is a
  requirement.
- The `@cloudflare/sandbox` package line matters: stable 0.x and the 1.0
  preview on the `@next` tag differ; new projects should start on `@next`,
  and a preview Worker package must pair with the matching preview container
  image.

### 4.6 Multi-tenancy and client dispatch

| Product                    | Role                                                                            | Facts that drive the decision (verified 2026-10-27)                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workers for Platforms      | Dispatch namespaces holding unlimited customer Workers behind a dispatch Worker | Untrusted mode by default (no `request.cf`, per-Worker cache); custom CPU and subrequest limits per customer; optional Outbound Worker for egress control (does not intercept DO or mTLS fetches; disables TCP `connect()`); up to 8 tags per Worker; no gradual deployments; no cron triggers on user Workers (silently dropped; use Durable Object alarms); Workflow, Queue, and Container bindings attachable to user Workers |
| Cloudflare for SaaS        | Custom hostnames and TLS for client domains                                     | Pairs with WfP or with a single multi-tenant Worker; check apex-domain plan requirements                                                                                                                                                                                                                                                                                                                                         |
| Durable Objects per tenant | Isolation inside one Worker                                                     | Per-tenant SQLite state with strict serializability; simplest model for standard engagements                                                                                                                                                                                                                                                                                                                                     |
| Previews                   | Isolation per branch, not per tenant                                            | Not a tenancy mechanism; listed here to avoid confusion                                                                                                                                                                                                                                                                                                                                                                          |

Workflow bindings are now attachable to user Workers (verified 2026-10-27),
which removes the constraint that made D1 option C mandatory for durable
processes. The remaining namespace gaps are cron triggers and gradual
deployments. D1's stated rationale predates this change; re-review is
tracked in DEV-109 before the decision is amended.

### 4.7 Delivery tooling: configuration, CI/CD, previews, releases

| Tool or feature          | Role                                          | Facts                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrangler                 | CLI for dev, deploy, resources, secrets       | `wrangler.jsonc` recommended for new projects; some newer features require JSON config; compatibility date should be today's date for new Workers                                                                                                                                                                                                                                                                                                           |
| Wrangler environments    | Named configurations under `env.<name>`       | Most keys inherit; bindings do not and must be declared per environment; with the Vite plugin, select via `CLOUDFLARE_ENV` at build time, not deploy time                                                                                                                                                                                                                                                                                                   |
| Previews                 | Isolated branch environments under one Worker | Requires Wrangler 4.135.0 or later; own variables, secrets, bindings, URL, observability; DO namespace and container instances auto-provisioned per Preview; KV, D1, R2 isolated only when bound to separate resources; Workflow bindings reuse existing Workflows; service bindings call production; routes and crons target production; queue consumers cannot target a Preview; public by default (protect with Access); 500 Previews per Worker on Paid |
| Versions and deployments | Upload, gradual rollout, rollback             | Rollback restores code only; connected resources and their data are not rolled back                                                                                                                                                                                                                                                                                                                                                                         |
| Workers Builds           | Git-connected build and deploy                | Default CI path; external CI (GitHub Actions) remains valid when repos need custom pipelines                                                                                                                                                                                                                                                                                                                                                                |
| C3 and framework guides  | Project scaffolding                           | `npm create cloudflare` and framework templates; vinext for Next.js                                                                                                                                                                                                                                                                                                                                                                                         |
| `cf` CLI                 | Next-generation CLI (beta)                    | Uses `cloudflare.config.ts`; do not mix with Wrangler in one project; watch item, not a lab default yet                                                                                                                                                                                                                                                                                                                                                     |
| Terraform or Pulumi      | Infrastructure as code for account resources  | Use for zones, DNS, Access policies, and namespaces that are not expressed in `wrangler.jsonc`                                                                                                                                                                                                                                                                                                                                                              |

Secrets handling facts that affect process:

- `wrangler secret put` and `secret delete` create and deploy a new version
  immediately; use the `wrangler versions secret` workflow when a secret
  change must be staged with code.
- Local secret files are not uploaded; `.dev.vars` is local only.
- The `wrangler login` OAuth flow does not support granular scopes; CI and
  agents use account-owned API tokens with the narrowest role.

### 4.8 Observability

| Signal or tool                  | Role                                                             | Facts (verified 2026-10-29)                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workers Logs                    | Stored, searchable invocation logs                               | Until 2026-11-30: Paid 20 million events per month included, then USD 0.60 per million; 7-day retention; Free 200,000 per day, 3 days. From 2026-12-01: shared Observability pool with Traces, AI Gateway logs, and others; Paid 50 GB ingestion plus 10 GB-month storage included per cycle, then 0.25 per GB and 0.10 per GB-month; Free 0.5 GB per day, 7-day retention |
| Workers Traces                  | Request flow and dependency latency                              | Enable `observability.traces.enabled` explicitly; the top-level flag alone does not enable traces                                                                                                                                                                                                                                                                          |
| Real-time logs, `wrangler tail` | Live debugging                                                   | Not a persistence mechanism                                                                                                                                                                                                                                                                                                                                                |
| Tail Workers                    | Custom processing of trace events (filter, redact, route)        | Receives events from dynamic dispatch and user Workers too; use for the lab audit trail (Appendix B)                                                                                                                                                                                                                                                                       |
| Workers Logpush                 | Deliver trace events to external storage                         | Paid only; 10 million requests per month included, then USD 0.05 per million; charged after filtering and sampling                                                                                                                                                                                                                                                         |
| OpenTelemetry export            | Push logs and traces to an OTel destination                      | Check first whether this replaces a custom Tail Worker                                                                                                                                                                                                                                                                                                                     |
| Analytics Engine                | Custom metrics and per-tenant usage                              | SQL-queryable; use for metering and spend dashboards                                                                                                                                                                                                                                                                                                                       |
| Agents SDK diagnostics          | `diagnostics_channel` events for state, RPC, schedule, lifecycle | Feed into the same audit path                                                                                                                                                                                                                                                                                                                                              |

### 4.9 Security and access

| Product or feature                             | Role                                                       | Notes (verified 2026-10-29)                                                                                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Worker secrets                                 | Per-Worker encrypted values                                | Default for credentials owned by one Worker                                                                                                                                                              |
| Secrets Store                                  | Account-level secrets shared across Workers and AI Gateway | Binding type `secrets_store_secrets`; binding requires Super Administrator or Secrets Store Deployer role; secret scopes now include `workers`, `ai_gateway`, `dex`, `access`, `containers`, `websearch` |
| Cloudflare Access                              | Identity-aware access to apps, Previews, internal tools    | Protect every Preview URL and every internal lab surface                                                                                                                                                 |
| Turnstile                                      | Bot verification for forms                                 | Server-side Siteverify required                                                                                                                                                                          |
| WAF, rate limiting, Bot Management, API Shield | Edge protection                                            | Rate limit public agent endpoints; schema-validate APIs                                                                                                                                                  |
| Roles, scopes, API tokens                      | Least privilege for humans, CI, and agents                 | Scope tokens to the Worker or product; never paste token values into chat or logs                                                                                                                        |
| Workers security model                         | Isolate-based separation                                   | The basis for Dynamic Workers; read before trusting any sandbox claim                                                                                                                                    |

### 4.10 Data governance products

| Capability                      | Product or feature                                                                      | Facts (verified 2026-10-29)                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Point-in-time recovery, SQL     | D1 Time Travel                                                                          | Always on; restore to any minute in the last 30 days on Paid (7 on Free); 10 restores per 10 minutes per database                           |
| Object versioning               | R2                                                                                      | No S3-style object versioning (GetBucketVersioning is a stub); version via distinct keys or a D1 index                                      |
| Regional processing and storage | Data Localization Suite                                                                 | Evaluate against actual contractual requirements; enterprise feature set                                                                    |
| Prompt and response privacy     | AI Gateway DLP, Guardrails, logging controls, Zero Data Retention under Unified Billing | Decide what may be stored before enabling payload logging; ZDR applies only to Unified Billing requests with Cloudflare-managed credentials |
| Log retention                   | Workers Logs 7 days; Logpush to R2 for longer                                           | Retention beyond 7 days requires export                                                                                                     |
| Workflow history                | 7-day default on Paid for Workflows created on or after 2026-09-10; 30-day max          | Export durable records before expiry                                                                                                        |

### 4.11 Frontend

| Need                   | Product                   | Notes (verified 2026-10-29)                                                                                                                                              |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Static site or SPA     | Workers Static Assets     | Free asset requests; SPA not-found handling available                                                                                                                    |
| React or framework app | Cloudflare Vite plugin    | Runs the Worker in `workerd` during Vite dev; generates output config at build                                                                                           |
| Next.js                | vinext                    | Vinext 1.0 released 2026-09-28; Cloudflare-recommended over OpenNext for new projects (OpenNext for existing apps with compatibility gaps); check feature parity per app |
| Images, video          | Cloudflare Images, Stream | Only when the requirement exists (Principle 6)                                                                                                                           |

### 4.12 Communications

| Need                       | Product         | Notes (verified 2026-10-29)                                                                                                                                                         |
| -------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transactional email        | Email Service   | Email Sending in public beta (2026-04-16); Paid only for arbitrary recipients: 3,000 per month included, then 0.35 per 1,000; sends to verified account addresses free on all plans |
| Inbound routing            | Email Routing   | Domain addresses to mailboxes                                                                                                                                                       |
| Inbound processing in code | Email Workers   | Agents SDK has an email channel with secure reply resolution                                                                                                                        |
| Web push                   | Agents SDK push | VAPID-based from agents                                                                                                                                                             |
