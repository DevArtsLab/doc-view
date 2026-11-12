# D1. Client dispatch model

| Option | Model                                                                             | Choose when                                                                                                                                                                                            |
| ------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A      | Workers for Platforms: each client app is a Worker in a dispatch namespace        | Clients need independent deploys, per-client CPU and subrequest limits, custom domains, or run their own code                                                                                          |
| B      | Single multi-tenant Worker with a Durable Object per tenant                       | Standard engagements, internal tools, early-stage client work                                                                                                                                          |
| C      | Hybrid: WfP for client-facing Workers, lab-owned Workers for Workflows and agents | Any time a WfP client needs durable processes; originally driven by the Workflows-in-namespace constraint, which no longer holds (bindings attachable since 2026; decision re-review pending, DEV-109) |

Default: B for standard engagements; C once a second flagship client proves
the need. Pure A was excluded for agentic clients because of the Workflows
constraint, which no longer holds; the decision stands pending re-review.
Decision criteria: data separation requirements,
deploy independence, metering and billing, custom domains, whether clients
run their own code, whether the client needs durable processes.

Consequences of C: the dispatch Worker and all Workflows live in the lab's
account Workers; client Workers call back into lab services through service
bindings or authenticated HTTP; the Outbound Worker governs client egress
but does not intercept Durable Object or mTLS fetches.
