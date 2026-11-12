# Open questions

| ID  | Question                                                                                                                                                                                                                                                                             | Owner          | Needed by                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------- |
| Q1  | Per-client metering and pricing model once Workers for Platforms is live (Analytics Engine as meter?)                                                                                                                                                                                | Lab lead       | Phase 4 design                                  |
| Q2  | Which AI providers anchor the stack, in what failover order, BYOK or Unified Billing                                                                                                                                                                                                 | Lab lead       | Phase 3 design                                  |
| Q3  | Is client code execution (Dynamic Workers or Containers) offered to clients or internal only                                                                                                                                                                                         | Lab lead       | Phase 4 design                                  |
| Q4  | Public license for the framework repository                                                                                                                                                                                                                                          | Lab lead       | Before Phase 5 and before any push of this repo |
| Q5  | OTel export versus Tail Worker as the primary audit path when a client has its own stack                                                                                                                                                                                             | Per client ADR | Phase 2                                         |
| Q6  | Adopt the `cf` CLI once stable, and migration plan from Wrangler                                                                                                                                                                                                                     | Lab lead       | Re-check monthly                                |
| Q7  | ~~End-user authentication default~~ Resolved 2026-10-25 by LAB-ADR-0001: identity-provider first, no shared credential database; SSO plus Access for internal, multi-tenant IdP per client for client services. Remaining per-project choice is which IdP, recorded as a project ADR | Resolved       | Resolved                                        |

An open question should carry a default and a needed-by where one is
reasonable. A question with a default resolves itself: if no answer
arrives by the time it is needed, the default applies and the decision is
recorded as an ADR noting it was taken by default. This keeps unmade
decisions from becoming permanent by silence. (Convention adopted from
the waykeeper open-decisions register, which gives every row a
recommendation, a default, and a needed-by.)
