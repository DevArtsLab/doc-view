# Reference architecture and project tiers

### 5.1 Architecture map

```text
+-- Development (local) -------------------------------------------------+
| repository checkout (foundation scaffold, Section 16)                   |
|   wrangler dev or Vite plugin: workerd + local D1, KV, R2, DO, Queues   |
|   .dev.vars for local configuration (gitignored)                        |
|   optional: cagent for agent flow prototyping (Section 15.4)            |
+------------------------------------+------------------------------------+
                                     | git push -> Workers Builds -> Preview per branch
                                     | merge to main -> production deploy
+-- Production (Cloudflare) ----------+------------------------------------+
| Edge      Workers + Static Assets (API, frontend, webhooks)             |
| State     D1 | KV | R2 | Durable Objects (SQLite)                       |
| Flow      Queues | Workflows | Cron Triggers                            |
| Agents    Agents SDK | Workers AI | AI Gateway | Dynamic Workers | Containers |
| Clients   Durable Object per tenant | Workers for Platforms | Cloudflare for SaaS |
| Ops       Workers Builds | Previews | Workers Logs and Traces | Tail Worker | Logpush | Analytics Engine |
| Security  Access | Secrets Store | WAF and rate limiting | Turnstile    |
+-------------------------------------------------------------------------+
```

### 5.2 Request and event paths

- Synchronous user request: Edge Worker authenticates, routes to a tenant
  Durable Object or D1 query, returns; static files bypass the Worker.
- Asynchronous job: Worker enqueues to Queues; consumer Worker processes in
  batches; failures retry with backoff; dead letters land in a second queue.
- Business process: Worker or agent starts a Workflow instance; steps
  checkpoint; approvals pause the instance via `waitForEvent`; completion
  writes a durable record to D1 and artifacts to R2.
- Agent session: client connects to an Agents SDK Durable Object; state
  syncs over WebSocket; tool calls go through MCP with scoped tokens; model
  calls go through AI Gateway; generated code executes in a Dynamic Worker.
- Audit: every Worker in the account has the lab Tail Worker attached; it
  redacts, filters, and writes to R2 plus Analytics Engine; Logpush delivers
  raw trace events for retention.

### 5.3 Project tiers

Tiers keep Principle 6 honest: a tier fixes the default product set, and
anything beyond the tier needs an ADR.

| Tier | Name                  | Typical project                                   | Default product set                                                                                                              | Not included by default             |
| ---- | --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| T0   | Static or landing     | Marketing site, docs site, portfolio              | Workers + Static Assets, Workers Logs, Access for previews                                                                       | Any storage, any AI                 |
| T1   | Application           | Form-backed site, dashboard, small SaaS           | T0 plus D1, KV (config), R2 (uploads), one DO class if coordination exists, Queues for background jobs, Turnstile, Email Service | Workflows, AI, WfP                  |
| T2   | Agentic application   | Assistant, automation, internal agent tool        | T1 plus Agents SDK, AI Gateway, Workers AI or BYOK providers, Workflows, Dynamic Workers, Tail Worker audit, Analytics Engine    | Containers, WfP                     |
| T3   | Multi-client platform | Flagship client delivery with independent deploys | T2 plus Workers for Platforms, Cloudflare for SaaS, Outbound Worker, per-client metering, Secrets Store                          | Nothing excluded; everything by ADR |

Lab operations itself is a T2 system that grows into T3 once it dispatches
client applications.
