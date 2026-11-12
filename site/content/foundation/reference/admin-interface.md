# Administrative management interface

The lab is operated by looking at it, not by reading documentation. This
section defines the visual control plane that makes platform state
observable and changeable.

### 23.1 Why this exists as a foundation concern

Every decision in this plan creates state that someone must see and
control: which features are live, which provider is serving inference
(D15), which agents are scheduled (Section 15), what spend has accrued
(Section 12), which secrets exist (D14). Without one interface, that state
is spread across vendor dashboards, config files, and log queries, and the
only way to answer "what is the system doing right now" is to read code.

The governing rule: **no silent fallback anywhere**. Any automatic
degradation (provider switch, cache bypass, queue backpressure, feature
disable) must surface as visible state in this interface and emit an audit
event. Fallback behavior is permitted; invisible fallback behavior is not.

### 23.2 Control surfaces

| Surface             | What it shows                                                                        | What it controls                                                               |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Feature flags       | Every flag, scope, current value, targeting rule, rollout percentage                 | Toggle on and off; target a tenant, user, or percentage; emergency kill switch |
| Model and provider  | Active provider, Devin quota consumed and remaining, fallback state (D15)            | Explicit provider selection; enable or disable local inference                 |
| Agents              | Registered agents, schedules, last run, outcome, session cost (Section 15)           | Enable, disable, pause, run now, change schedule                               |
| Delivery lifecycle  | Each engagement's Workflow instance, current phase, pending gates (Section 8)        | Approve or reject gates with Access identity recorded                          |
| Environments        | Worker versions per environment, Preview inventory, binding map, drift warnings      | Promote, roll back, delete stale Previews                                      |
| Cost and limits     | Spend by product, AI Gateway spend against caps, limits approached (Sections 12, 13) | Adjust spend caps and CPU limits; set alert thresholds                         |
| Audit feed          | Live stream of Appendix B events, filterable by tenant, actor, and event             | Nothing; read-only by design                                                   |
| Secret inventory    | Secret names, scopes, owners, age, rotation due (D14, never values)                  | Trigger a rotation Workflow                                                    |
| Tenants and clients | Per-client status, isolation model, metering (D1, Section 11)                        | Suspend, resume, adjust per-client limits                                      |
| Data governance     | Classification register, retention schedules, restore-test recency (Section 11)      | Trigger a restore test or retention run                                        |

### 23.3 Toggle contract

Every toggle in the interface declares the same metadata, so the interface
is generated from the registry of toggles rather than hand-built:

| Field          | Meaning                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `id`           | Stable identifier used in code and in audit events                          |
| `scope`        | lab, project, tenant, or user                                               |
| `default`      | Value when no override exists                                               |
| `owner`        | Who is accountable for its state                                            |
| `kind`         | Release flag (temporary), operational toggle (permanent), or kill switch    |
| `blast_radius` | What breaks when it is off; shown in the UI before the switch is thrown     |
| `audit_event`  | Event emitted on change (Appendix B `flag.changed`)                         |
| `expires_at`   | Required for release flags, so temporary flags do not become permanent debt |

`expires_at` is enforced: a release flag past its expiry fails CI, so a
temporary flag cannot quietly become permanent state.

### 23.4 Implementation model

- Flag state lives in Flagship, which provides targeting and percentage
  rollouts independent of deploys (Section 4.4), so toggling never requires
  a deployment.
- The interface itself is a lab-owned Worker with Static Assets, built from
  the D11 component registry, behind Cloudflare Access (D9). It is a T2
  surface and inherits every guardrail in Section 10.
- Reads come from Analytics Engine (metrics and metering), Workers Logs and
  the audit R2 bucket (events), D1 (project, tenant, and toggle registry),
  and the Cloudflare API for version, Preview, and binding state.
- Writes go through the same approval path as everything else: a change
  with a blast radius above a declared threshold opens a Workflow gate
  rather than applying immediately.
- Operating it is itself auditable: the interface is not a back door around
  Section 10.

### 23.5 Division of responsibility with vendor consoles

The lab interface does not attempt to replace vendor administration. The
split is explicit so there is no ambiguity about where to act:

| Concern                                                                                      | Where it is administered                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Agent sessions, machine access, agent secrets, infrastructure and analytics for agentic work | The Devin Administration space (access, infrastructure, analytics) |
| Cloudflare account resources, DNS, zones, Access policies                                    | The Cloudflare dashboard, or Terraform for declared resources      |
| Product feature state, tenant state, lifecycle gates, lab-wide toggles                       | The lab administrative interface defined in this section           |
| Work tracking and decisions                                                                  | Linear (Section 15.3)                                              |

Where a vendor console is authoritative, the lab interface links to it and
mirrors read-only status rather than duplicating control.

### 23.6 Roadmap placement

This interface is built incrementally alongside the phases in Section 17:
the audit feed and environment view accompany Phase 1, flags and the model
and provider toggle accompany Phase 3, and tenant and metering views
accompany Phase 4. A static read-only version is acceptable in Phase 1;
write paths require the approval gates described above.

---
