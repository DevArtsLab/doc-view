# Audit event catalog (baseline)

Every project emits at least these events through the Tail Worker or
application logging. Field names are illustrative; the schema is defined in
the scaffold.

Integrity rules, adopted from the waykeeper Logbook:

- Events use the CloudEvents 1.0 envelope; event types are registered in a
  schema file, and unregistered types are rejected.
- Payloads are referenced by digest (`inputs_digest`, `outputs_digest`),
  never embedded raw; the log proves tampering without storing content.
- Each tenant's events form a hash chain: `hash = sha256(prev_hash +
normalized_json(event))` over deterministically serialized JSON (sorted
  keys, no whitespace). The chain is verified on a schedule and the
  verification result is itself an event.
- The write is synchronous: the event lands before the step's result is
  returned. No event, no result.
- Deletion replaces content fields with tombstones while keeping the
  chain valid.

| Event                            | Emitted when                                                               | Minimum fields                                               |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `request.handled`                | Any Worker invocation completes                                            | worker, environment, outcome, cpu_ms, wall_ms, tenant        |
| `agent.session.started`          | Agents SDK instance created or resumed                                     | agent, session_id, tenant, trigger                           |
| `agent.tool.called`              | Any MCP or binding tool invocation                                         | agent, session_id, tool, scope, duration_ms, outcome         |
| `agent.model.called`             | Any AI Gateway request                                                     | gateway, provider, model, tokens_in, tokens_out, cost, cache |
| `agent.state.changed`            | `setState` or SQL write in an agent                                        | agent, session_id, keys_changed                              |
| `workflow.step.completed`        | Workflow step returns                                                      | workflow, instance_id, step, attempt, duration_ms            |
| `gate.requested`                 | Workflow waits for approval                                                | workflow, instance_id, gate, requested_of                    |
| `gate.approved`, `gate.rejected` | Approval event received                                                    | workflow, instance_id, gate, approver (Access identity)      |
| `data.read`, `data.write`        | Access to client-confidential or regulated data                            | dataset, class, tenant, actor, operation                     |
| `data.deleted`                   | Retention or deletion Workflow step runs                                   | dataset, class, tenant, policy, count                        |
| `secret.rotated`                 | Secrets Store value replaced                                               | secret_name (never value), actor                             |
| `flag.changed`                   | Any toggle changed in the admin interface (Section 23)                     | flag_id, scope, from, to, actor, blast_radius                |
| `provider.switched`              | Model or inference provider changed, manually or on quota exhaustion (D15) | from, to, reason, actor or "automatic"                       |
| `authz.denied`                   | An authorization check rejects a request (D13)                             | subject, resource, action, policy, tenant                    |
| `identity.resolved`              | Product identity manifest loaded at build (D12)                            | product_slug, display_name, manifest_version                 |
| `deploy.completed`               | Production or Preview deployment                                           | worker, version, environment, actor                          |
| `sandbox.executed`               | Dynamic Worker or Container run                                            | kind, egress_allowed, duration_ms, outcome                   |
| `limit.hit`                      | CPU, spend, rate, or backlog limit reached                                 | limit, worker or gateway, value                              |
| `audit.chain.verified`           | Scheduled verification of a tenant's event hash chain                      | tenant, result, events_checked                               |
| `pii.redacted`                   | A sentinel replaces a personal value with a placeholder                    | file, entity_type, token (never the value), actor            |
