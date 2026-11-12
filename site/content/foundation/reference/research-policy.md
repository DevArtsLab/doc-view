# Research method and fact decay policy

### 2.1 Method

- Primary sources are the official Cloudflare developer docs, read in their
  markdown form (`index.md` endpoints) on the verification date.
- Secondary sources are the Cloudflare-maintained agent skills bundle
  (`cloudflare/skills`), which encodes product selection guidance and
  anti-patterns, and the Agents SDK repository docs.
- No vendor blog posts, third-party tutorials, or model memory were used for
  quantitative claims.
- Each claim that can change (limit, price, plan availability, beta status)
  carries a row in the Section 22 source register.

### 2.2 Decay policy

Cloudflare ships platform changes weekly. The following classes decay at
different rates and must be re-verified on the stated cadence:

| Class                          | Examples                                                                  | Re-verify                                 |
| ------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------- |
| Prices and included allotments | Workers requests and CPU-ms, Logs, Logpush                                | Quarterly, and before any client estimate |
| Hard limits                    | D1 10 GB, Queues 128 KB, Workflows step result                            | Quarterly                                 |
| Beta and preview status        | Secrets Store, Sandbox SDK, Containers policies, `cf` CLI, Artifacts      | Monthly                                   |
| Recommended defaults           | `wrangler.jsonc`, vinext over OpenNext, Previews over Version URL aliases | Quarterly                                 |
| Product names                  | Browser Rendering to Browser Run, Pipelines to Basin, Sandbox naming      | On encounter                              |
| Deprecations                   | AI Gateway Unified API for single-model calls, Pages for new projects     | Quarterly                                 |

Verification is a Section 22 register update plus a pass note in
`../research/foundation/source-verification-log.md`. Log the refinement in Linear
as well.
