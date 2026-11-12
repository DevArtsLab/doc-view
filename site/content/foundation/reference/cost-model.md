# Cost model

All figures USD, verified 2026-11-01, Workers Paid plan (Standard usage
model). Re-verify before quoting (Section 2.2).

| Item                                                      | Included per month          | Overage                                                                                                                                                           |
| --------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subscription                                              | n/a                         | 5.00 minimum per account                                                                                                                                          |
| Worker requests                                           | 10 million                  | 0.30 per additional million                                                                                                                                       |
| Worker CPU time                                           | 30 million CPU-ms           | 0.02 per additional million CPU-ms                                                                                                                                |
| Static asset requests                                     | Unlimited                   | Free                                                                                                                                                              |
| Egress and bandwidth                                      | Unlimited                   | Free                                                                                                                                                              |
| Workers Logs                                              | 20 million events           | 0.60 per additional million; from 2026-12-01 shared Observability pool: 50 GB ingestion plus 10 GB-month storage included, then 0.25 per GB and 0.10 per GB-month |
| Workers Logpush                                           | 10 million requests         | 0.05 per additional million                                                                                                                                       |
| D1, KV, R2, DO, Queues, Workflows, AI Gateway, Workers AI | Product-specific allotments | See each product's pricing page (Section 22)                                                                                                                      |

Worked estimates (requests and CPU only; storage and AI billed separately):

| Scenario                                        | Requests          | CPU per request | Estimate                                            |
| ----------------------------------------------- | ----------------- | --------------- | --------------------------------------------------- |
| T0 site, 15 million requests, 80 percent static | 3 million dynamic | 7 ms            | 5.00 (all within included)                          |
| T1 app, 15 million dynamic requests             | 15 million        | 7 ms            | 8.00 (5.00 + 1.50 requests + 1.50 CPU)              |
| Hourly cron agent, 3 minutes CPU per run        | 720               | 180,000 ms      | 6.99                                                |
| T2 agent platform, 100 million requests         | 100 million       | 7 ms            | 45.40; 34.20 with 80 percent Workers Cache hit rate |

Cost controls that are part of the foundation: `limits.cpu_ms` per Worker,
AI Gateway spend limits per gateway, Analytics Engine metering per tenant,
monthly cost review in the Operate phase, and a per-project budget recorded
in the Design ADR set.
