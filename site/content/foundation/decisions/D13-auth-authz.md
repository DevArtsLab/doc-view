# D13. Authentication and authorization from day one

Default: every project declares its authentication and authorization model
before its first route exists, and implements it from the lab's shared auth
package rather than per-app reinvention.

Three planes are designed separately and never conflated:

| Plane          | Subjects                                | Default mechanism                                                                                                                                                                                     |
| -------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| End user       | Customers and product users             | Identity-provider first per LAB-ADR-0001: no shared credential database; each app keeps its own profile table keyed by the IdP subject claim; the integration module ships through the registry (D11) |
| Administrative | Lab staff, operators, internal surfaces | Cloudflare Access in front of every admin and internal surface (D9); Access identity is the approver identity in Workflow gates                                                                       |
| Machine        | Agents, CI, service-to-service          | Scoped API tokens and OAuth-secured MCP servers with least-privilege tool scopes (Section 10)                                                                                                         |

Authorization rules that hold regardless of provider:

- Authorization is evaluated server-side, always. A client-side check is a
  display concern, never a control.
- Permissions are expressed as roles plus scopes against resources, not as
  boolean `isAdmin` flags.
- Tenant isolation is structural, per D1 and D3: a request carries a tenant
  identity and reaches only that tenant's Durable Object or database.
- Every authorization denial and every privilege change emits an audit
  event (Appendix B).
- Session, token, and refresh handling live in the shared module, so a
  vulnerability is fixed once for all products.

The identity layer is centralized while credential storage is not. This is
the substance of [LAB-ADR-0001](LAB-ADR-0001-centralized-identity-layer.md)
(accepted 2026-10-25, lab-wide):

- Internal products federate through SSO plus Cloudflare Access, so there
  is no user database to build or operate.
- Client services use a multi-tenant identity provider with one isolated
  tenant per client, which keeps client end-user data with the client and
  preserves a clean handoff path.
- A single shared authentication database is explicitly rejected: it is one
  point of compromise across every client, and it blocks offboarding.
- Administrative observability is a telemetry concern, met with identity
  provider audit logs and error tracking, not by co-locating credentials.

Consequence: auth is a Phase 1 spine concern, not a pre-launch retrofit.
What ships through the registry (D11) is the integration module, session
handling, and authorization policy evaluation, which makes it a reusable
asset under D12 rather than per-product work. Credentials themselves never
live in lab-built tables.
