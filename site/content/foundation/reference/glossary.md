# Glossary

| Term               | Meaning                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Binding            | Configuration-declared handle through which a Worker reaches a resource (`env.DB`, `env.AI`) |
| Coordination atom  | The entity a Durable Object instance represents: tenant, session, room, agent                |
| Dispatch namespace | Workers for Platforms container for customer Workers                                         |
| Dynamic Worker     | Worker created at runtime by a Worker Loader binding                                         |
| Gate               | Workflow step that waits for an approval event                                               |
| Preview            | Isolated branch environment under the same Worker (distinct from Wrangler environments)      |
| Tail Worker        | Worker that receives trace events from other Workers                                         |
| Time Travel        | D1's always-on point-in-time recovery                                                        |
| Tier               | T0 to T3 default product set (Section 5.3)                                                   |
| Browser Run        | Current name of Browser Rendering                                                            |
| Basin              | Current name of Pipelines, R2 Data Catalog, and R2 SQL                                       |
| Sandbox            | Umbrella for Dynamic Workers and Containers used to run untrusted code                       |
