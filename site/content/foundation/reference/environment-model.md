# Local parity and environment model

### 6.1 What parity means and does not mean

- Runtime parity holds: local `workerd` is the production runtime.
- Data parity is simulated: Miniflare emulates D1, KV, R2, Durable Objects,
  Queues, and Workflows locally with local persistence. Semantics match;
  scale and latency do not.
- Network parity is partial: AI Gateway, external providers, and Access are
  real network services. Remote bindings let a local Worker talk to real
  resources; this is powerful and dangerous (writes go to real data).
- Policy parity is absent locally: WAF, rate limiting, Access, and Turnstile
  do not run in `wrangler dev`. They are verified in Preview.

### 6.2 Local rules

1. `.dev.vars` holds local configuration and test credentials; it is
   gitignored and never contains production secrets. A committed
   `.dev.vars.example` documents required keys with placeholder values.
2. Local data persists in the project's Wrangler state directory and is
   disposable. Seed scripts recreate it (implementation lives in the
   scaffold, not here).
3. Remote bindings are off by default; enabling one is a deliberate,
   documented act and never targets production resources.
4. Tests run with the Workers Vitest integration against the same runtime;
   Durable Object and Workflow tests use the official test APIs.
5. Compatibility date is pinned per project and advanced deliberately with a
   test run.

### 6.3 Why not Docker for the application

Containers add a second runtime with its own drift. The Workers runtime is
already reproducible locally. Docker is reserved for cagent prototyping
(Section 15.4) and for Containers-based sandboxes, which are a production
product in their own right.

## 7. Environment model: dev, preview, production

| Environment | Mechanism                                | Resources                                                                                                                 | Access                            | Who deploys                             |
| ----------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------- |
| dev         | `wrangler dev` on the developer machine  | Local Miniflare state; remote bindings off                                                                                | Localhost                         | Developer or agent                      |
| preview     | Workers Previews, one per branch or PR   | Preview-specific DO namespaces and containers automatically; separate D1, KV, R2 bound explicitly in the `previews` block | Public URL; must be behind Access | Workers Builds on push                  |
| prod        | Production deployment of the same Worker | Production bindings                                                                                                       | Public, custom domain             | Workers Builds on merge; humans approve |

Rules derived from the Previews facts in Section 4.7:

- Never bind a Preview to a production D1, KV, or R2 resource. Isolation is
  only real when the Preview block declares its own resources.
- Workflows are shared across Previews; a Preview that starts a Workflow
  starts it in the real Workflow namespace. Design Workflow instance IDs to
  carry an environment prefix so Preview runs are identifiable and purgeable.
- Queue consumers cannot target a Preview; test consumers locally and in
  production with feature flags (Flagship), not in Previews.
- Service bindings from a Preview call production; a Preview of a frontend
  Worker will talk to the production API Worker unless the API also exposes a
  Preview and the frontend is pointed at it explicitly.
- Preview URLs on `workers.dev` carry `X-Robots-Tag: noindex`; custom-domain
  Previews need Access to stay unindexed and private.
- Wrangler environments (`env.<name>`) remain the mechanism for persistent,
  separately deployed Workers such as a long-lived staging. Previews are for
  branches. The lab uses Previews for branches and does not run a permanent
  staging unless a client contract requires one.
