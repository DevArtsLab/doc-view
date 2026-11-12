# Workspace store: entity-first layout (D14)

The target tree. The workspace root is the unit of portability: move it,
and nothing breaks. Delete any project directory, and no secret is lost.

```text
<workspace-root>/                     any path; discovered, never hardcoded
|
|-- .workspace.json                   ROOT MARKER (tracked)
|     identifies the root, declares schema version and store layout
|
|-- config/                           the ONLY location for PII and secrets
|   |
|   |-- registry.json                 generated inventory: names, scopes,
|   |                                 owners, rotation due, consumers
|   |                                 (names and metadata only, never values)
|   |
|   |-- identity/<brand>.json          D12 manifests (tracked, non-secret)
|   |
|   |-- profiles/                      person data (ENCRYPTED, tracked as ciphertext)
|   |   |-- operator.sops.json         replaces today's plaintext pii.json
|   |   +-- profile.schema.json        schema (tracked, plaintext)
|   |
|   |-- _shared/                       credentials shared across entities
|   |   +-- <platform>/<env>/secrets/
|   |
|   |-- projects/<slug>/               entity axis: owning project
|   |   +-- <platform>/<env>/
|   |       |-- secrets/               (ENCRYPTED)
|   |       |-- config/                (non-secret settings)
|   |       +-- data/                  (manifests, seed, schemas)
|   |
|   |-- orgs/<slug>/                   partner orgs (multi-tenant entities)
|   |-- consultants/<slug>/
|   |
|   +-- env/<entity-path>/             rendered dotenv, gitignored;
|                                      path mirrors the entity path
|
|-- career-tracker/                    a project; contains NO secret values
|   |-- .env.example                   required key NAMES with placeholders
|   +-- project.json                   declares slug + the secret ids it needs
|
+-- <other projects>/                  same contract
```

Layout rules:

- Partition by owning entity first; providers nest underneath. A new
  project, org, or consultant is one new top dir - no reshuffling.
- Uniform leaf: every `<entity>/<platform>/<env>/` holds the same
  `{secrets, config, data}` triple. `_default` and `_template` dirs hold
  per-entity-type defaults (proven in the RTS repository).
- Encrypt `secrets/` subtrees only; `config/` and `data/` stay tracked
  plaintext. `env/` renders gitignored dotenv at the mirrored entity path.

Data flow for a local run:

```text
  developer or agent runs a project task
            |
            v
  resolve workspace root (Section 5)
            |
            v
  read project.json -> list of required secret ids
            |
            v
  decrypt only those ids under config/projects/<slug>/  (age key from OS keychain)
            |
            v
  inject as environment variables into the child process only
            |
            v
  process exits -> plaintext is gone; nothing written to the project tree
```

Why this satisfies the requirements:

- **Delete a repository safely.** Credentials live under
  `config/projects/<slug>/`, outside the checkout. Removing the
  checkout removes no secret. Re-cloning restores a working project with no
  credential re-entry.
- **Move the workspace.** Every path is relative to the discovered root, so
  relocating to a different user profile, a container mount, or another
  machine changes one thing: where the root happens to be.
- **Rebrand.** Identity manifests are data in `config/identity/`, so the
  brand is swapped, not refactored.
- **Keyed by slug, not path.** Renaming or relocating a project directory
  does not orphan its secrets.
