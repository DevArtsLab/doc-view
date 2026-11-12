# Staging, production, and distributed secrets tiers

### 7.1 The two integration patterns

Every option reduces to one of two shapes:

| Pattern                | How it works                                                                                                                                       | Trade-off                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Sync into the platform | The store is the source of truth; values are pushed into the platform's own secret store; the app reads ordinary bindings or environment variables | Simple, no runtime dependency, no startup latency; values exist in two places and can drift                            |
| Fetch at runtime       | The platform holds one bootstrap credential; the app pulls the rest at startup                                                                     | One source of truth; adds a runtime dependency, a startup cost, and a bootstrap credential that is now the crown jewel |

Recommendation for the lab: **sync into the platform.** The production
architecture is Cloudflare-native, where bindings are the integration layer
(foundation Principle 8) and a runtime fetch would trade a configuration
concern for an availability dependency. Drift is managed by making the sync
one-directional and automated, never manual dashboard editing.

### 7.2 Options assessed

| Option                                    | Model                                         | Fit for the lab                                                                                                                                                                                                                                            |
| ----------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Secrets Store + Worker secrets | Platform-native, account-level and per-Worker | **Default.** Already the D8 decision; bindings, no extra vendor, no extra bill. Constraint: open beta, and currently integrated with Workers and AI Gateway only, so it is not a whole-estate store                                                        |
| SOPS with age                             | Encrypted files in git                        | **Default for local and for low-churn declarative config.** Zero infrastructure, no vendor. Not for high-churn live keys (Section 6)                                                                                                                       |
| 1Password with service accounts           | Managed, human plus machine                   | **Strong candidate for the human and bootstrap tier.** Already the right home for recovery codes and certificates; service accounts scope machine access per vault, and secrets can be injected into a process for its lifetime only without touching disk |
| Infisical                                 | Open source, self-hostable                    | Best fit if a single cross-platform runtime store becomes necessary; MIT-licensed with a self-host path, so it does not add vendor lock-in                                                                                                                 |
| Doppler                                   | Managed SaaS only                             | Excellent developer experience, but no self-host path and per-user pricing; conflicts with the self-hosted posture in career-tracker ADR-0016                                                                                                              |
| HashiCorp Vault / OpenBao                 | Self-hosted, dynamic secrets, PKI             | Most capable (dynamic credentials, encryption as a service), and the heaviest to operate. Revisit only when dynamic database credentials or internal PKI become real requirements                                                                          |

### 7.3 Recommended target architecture

A three-tier model, chosen because no single store covers every plane well:

```text
  TIER 1  Human and bootstrap material
          Password manager with service accounts
          recovery codes, certificates, the age identity,
          the few bootstrap tokens that unlock other tiers
                        |
                        v
  TIER 2  Source of truth for application configuration
          SOPS + age ciphertext in the config store (Section 4)
          declarative, reviewable, environment-scoped
                        |
                        | one-directional automated sync
                        v
  TIER 3  Runtime stores, per platform
          Cloudflare Worker secrets / Secrets Store  (production runtime)
          GitHub Actions secrets                      (CI)
          Devin secrets                               (agent sessions)
          other platform stores as needed
                        |
                        v
          applications read bindings and environment variables only
```

Rules for the sync:

- One direction only, Tier 2 to Tier 3. A dashboard edit is drift and gets
  overwritten; this is intentional.
- Environment-scoped: a staging value can never be promoted into production
  by accident, because the mapping is declared, not typed.
- Rotation is a tracked operation that updates Tier 2 and re-syncs, and
  emits an audit event (reference/audit-events.md `secret.rotated`).
- The secret inventory surfaces in the administrative interface
  (foundation Section 23), by name and metadata only.

Note the deployment mechanics already recorded in foundation Section 4.7:
`wrangler secret put` deploys a new version immediately, so a secret change
that must ship with code uses the staged versions workflow instead.

## 8. Plane 4: distributed and self-hosted products

For products shipped to users under a self-hosted distribution ADR
(career-tracker ADR-0016 is the reference case), the posture inverts: the
lab must hold nothing.

| Concern               | Rule                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| User credentials      | Generated and stored on the user's machine; never transit lab infrastructure                                |
| OAuth client identity | The app's own client registration may ship with the product; user tokens never do                           |
| Default posture       | A fresh install contains no lab credential of any kind                                                      |
| Telemetry             | Off by default; any opt-in path carries its own classification under foundation Section 11                   |
| Lab liability         | Nothing to breach means nothing to disclose; this is the compliance argument behind career-tracker ADR-0016 |
