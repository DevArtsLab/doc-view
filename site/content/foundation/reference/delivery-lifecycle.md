# Delivery lifecycle as a durable Workflow

The lab models each project engagement as one Workflow instance with five
phases. Each phase is a step group that checkpoints its outputs and pauses
on a `waitForEvent` approval gate.

| Phase       | Inputs                       | Work (human and agent)                                                      | Produced artifacts (durable)                                                                  | Gate to exit                                                    |
| ----------- | ---------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Research    | Intake brief, client context | Context gathering, competitive scan, requirements draft, risk register      | Research dossier in R2; D1 project record; Linear issue tree                                  | Client and lab lead approve problem statement and scope         |
| Design      | Dossier                      | Architecture proposal, data model, tier selection, ADR drafts, UX direction | Design pack in R2 (versioned); ADRs D1 to D10 instantiated; guides/predevelopment.md exit criteria met | Architecture review passes; cost estimate within budget         |
| Development | Design pack                  | Scaffold from foundation, implement, test, preview per branch               | Preview deployments; test reports; audit log samples                                          | All exit criteria of predevelopment Section 8; security review |
| Launch      | Approved preview             | Promote to production, DNS and custom domain, Access policies, runbook      | Production release record; client runbook; restore test evidence                              | Launch checklist complete; monitoring live; rollback rehearsed  |
| Operate     | Production                   | Monitoring, cost review, dependency updates, quarterly fact re-verification | Monthly operations report in R2 and D1                                                        | Continuous; feeds back into Research for the next engagement    |

Mechanics:

- The Workflow instance ID is the project slug plus engagement number, so
  any agent or human can locate state deterministically.
- Each step writes its intent to D1 before performing external side effects
  (idempotency by construction; Section 9, D2).
- Approval events carry the approver identity from Access and are written
  to the audit trail (Appendix B, `gate.approved`).
- Artifacts over 1 MiB are stored in R2 with the key returned by the step.
- Because completed Workflow state retention defaults to 7 days on Paid for
  new Workflows (30-day maximum), the final step exports a project summary
  record to D1 and the full step log to R2.

## 9. Foundation decisions D1 to D15

Each decision has a default, the alternatives, the criteria that would
change it, and the facts that drove it. Projects instantiate these as ADRs
(Appendix A) and record deviations.
