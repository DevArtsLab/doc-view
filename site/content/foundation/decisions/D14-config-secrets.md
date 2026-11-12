# D14. Configuration and secret management

Default: one centralized configuration and secret store per environment
plane, with repositories holding references and never values.

| Plane                       | Store                                                                                                     | Rule                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Local development           | A single workspace-root store outside every repository, resolved by relative path                         | Deleting any repository must not lose its secrets; moving the workspace root must not break resolution               |
| Staging and production      | Platform-native stores: Worker secrets per Worker, Secrets Store for shared and account-level values (D8) | One source of truth, synced outward; never hand-copied between dashboards                                            |
| Distributed and self-hosted | The user's machine or deployment                                                                          | The lab holds nothing; credentials never traverse lab infrastructure (self-hosted products, career-tracker ADR-0016) |

Non-negotiables:

- PII is never committed to any repository, including private and
  local-only repositories, because a remote can be added later.
- Long-lived plaintext secrets on disk are a finding, not a convention.
  Material at rest is encrypted (SOPS with age for file-based config, the
  OS keychain or a password manager for human-held material).
- Secrets never enter agent context, prompts, or logs (Principle 7).
- Every secret has a named owner, a scope, and a rotation trigger.

Full architecture, platform-by-platform secret-store inventory, and the
staging and production research strategy live in
the reference contracts under `../reference/` (store layout, resolution,
protection, tiers, inventory).
