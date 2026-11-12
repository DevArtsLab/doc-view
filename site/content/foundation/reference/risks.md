# Risks and mitigations

| Risk                                                      | Likelihood | Impact | Mitigation                                                                                                                       |
| --------------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Platform facts drift (prices, limits, betas)              | High       | Medium | Section 2.2 decay policy; quarterly verification; Section 22 register                                                            |
| Vendor concentration on Cloudflare                        | Medium     | High   | Bindings keep application code portable in shape; R2 is S3-compatible; D1 and DO use SQLite; documented export paths per product |
| Beta dependency in a client commitment                    | Medium     | High   | Tier defaults use GA products; betas need an ADR with a fallback                                                                 |
| WfP namespace gaps: no cron triggers, no gradual rollouts | Certain    | Low    | Workflow bindings attachable to user Workers (verified 2026-10-27); schedule from dispatch Worker or DO alarms                   |
| D1 10 GB ceiling reached                                  | Medium     | Medium | Per-tenant or per-domain databases from day one; Hyperdrive escape hatch                                                         |
| Preview leaks production data                             | Medium     | High   | Rule: no production bindings in Previews; Access on all Previews; review diff                                                    |
| Agent cost runaway                                        | Medium     | Medium | AI Gateway spend limits; `limits.cpu_ms`; retry caps; monthly cost review                                                        |
| Observability pricing change (2026-12-01)                 | Certain    | Low    | Re-estimate log volume before December; sampling policy ready                                                                    |
| Deprecation of AI Gateway `/compat` endpoints             | Certain    | Low    | Use the REST API (`/ai/v1/*`) or `ai` binding for single calls and dynamic routes                                                |
| Over-engineering small projects                           | Medium     | Medium | Tier system; ADR required to exceed tier                                                                                         |
