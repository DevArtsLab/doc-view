# Limits and capacity cheat sheet

Consolidated from Section 4; every number is a hint to re-verify.

| Product               | Limit                                        | Workers Paid value                                                                          |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Workers               | CPU per request                              | 30 s default, 5 min max                                                                     |
| Workers               | Memory per isolate                           | 128 MB                                                                                      |
| Workers               | Subrequests per request                      | 10,000                                                                                      |
| Workers               | Workers per account                          | 500                                                                                         |
| Workers               | Worker size                                  | 64 MiB                                                                                      |
| Workers               | Cron Triggers per account                    | 250                                                                                         |
| Workers               | Wall time: HTTP                              | Unlimited while client connected                                                            |
| Workers               | Wall time: cron, queue consumer, DO alarm    | 15 min                                                                                      |
| Workers               | CPU: cron trigger                            | 30 s under 1-hour intervals; 15 min at 1-hour or longer                                     |
| Workers               | `waitUntil` after response                   | 30 s                                                                                        |
| Static Assets         | Files per version; file size                 | 100,000; 25 MiB                                                                             |
| D1                    | Database size                                | 10 GB (not raisable)                                                                        |
| D1                    | Databases per account; storage per account   | 1,000,000 (100,000 included, 0.10 per month each above); 1 TB (raisable)                    |
| D1                    | Time Travel                                  | 30 days; 10 restores per 10 min per database                                                |
| D1                    | Queries per invocation                       | 1,000                                                                                       |
| D1                    | Columns; bound params; statement length      | 100; 100; 100 KB                                                                            |
| D1                    | Max row, string, or BLOB size                | 2 MB                                                                                        |
| D1                    | Query duration                               | 30 s                                                                                        |
| D1                    | Query result size                            | 50 MB (enforced from 2026-11-04; REST import/export exempt)                                 |
| Durable Objects       | Storage per object                           | 10 GB (SQLite)                                                                              |
| Durable Objects       | Classes per account                          | 500                                                                                         |
| Durable Objects       | Throughput per object                        | about 1,000 requests per second (soft)                                                      |
| Durable Objects       | WebSocket message (received)                 | 32 MiB                                                                                      |
| Queues                | Queues per account                           | 10,000 default (unlimited; 0.10 per month per queue above)                                  |
| Queues                | Message size; retries; batch                 | 128 KB; 100; 100 messages                                                                   |
| Queues                | Throughput per queue                         | 5,000 messages per second                                                                   |
| Queues                | Retention; backlog                           | up to 14 days; 25 GB                                                                        |
| Queues                | Concurrent push consumers                    | 250                                                                                         |
| Workflows             | Step result; event payload                   | 1 MiB each                                                                                  |
| Workflows             | Persisted state per instance                 | 1 GB                                                                                        |
| Workflows             | Steps per instance                           | 10,000 default, 25,000 max                                                                  |
| Workflows             | Sleep                                        | 365 days                                                                                    |
| Workflows             | Completed state retention                    | 7-day default on Paid for Workflows created on or after 2026-09-10; 30-day max; 3 days Free |
| Workflows             | Concurrent instances per account             | 50,000 (waiting instances excluded)                                                         |
| Workflows             | Instance creation rate                       | 300 per second per account; 100 per second per workflow                                     |
| Workflows             | Workers for Platforms namespaces             | Workflow bindings attachable to user Workers                                                |
| Previews              | Previews per Worker; deployments per Preview | 500; 100                                                                                    |
| Workers for Platforms | Workers per namespace; tags per Worker       | Unlimited; 8                                                                                |
| Workers for Platforms | Gradual deployments; cron triggers           | Not supported; not on user Workers (use DO alarms)                                          |
| Dynamic Workers       | Concurrent distinct per I/O context          | 4 per Worker request; 10 per Durable Object; Paid only                                      |
| Workers Logs          | Retention                                    | 7 days                                                                                      |
| Cloudflare API        | Rate limit                                   | 1,200 requests per 5 min per account; 200 per second per IP                                 |
| Request body          | Maximum (zone plan dependent)                | 100 MB Free and Pro; 200 MB Business; up to 5 GB Enterprise                                 |
