# Repository scaffold and documentation platform

One layout for every repository created from this foundation. This
reconciles earlier `md/` and `docs/` variants into a single tree;
`docs/` is the documentation root.

```text
<repo>/
  AGENTS.md                     agent-facing conventions for this repo
  README.md                     human entry point; links to docs/
  REPO_INDEX.md                         what lives where (regenerated on change)
  LICENSE                       per Q4; public repos must carry one
  SECURITY.md                   disclosure contact and supported versions
  .gitignore                    env files, keys, build output, OS junk
  .dev.vars.example             local configuration template; never real secrets
  wrangler.jsonc                environments, previews block, bindings, limits
  src/                          Worker entrypoint, domain modules, agents, workflows
  test/                         Workers Vitest integration tests
  docs/
    foundation.md                copy or pointer to this plan at the adopted revision
    predevelopment.md          pointer to the blueprint; filled checklist for this project
    adr/                        ADR-0001 to ADR-0015 reserved for foundation decisions D1 to D15 in order; project-specific ADRs start at ADR-0016 (see numbering rule below)
    research/                   market, competitors, personas, requirements (Research phase)
    design/                     PRD, user flows, wireframes, visual direction
    architecture/               C4 diagrams, data models, environment map, cost estimate
    agents/                     one card per agent: tools, scopes, state, approvals
    governance/                 data classification register, retention schedule, audit event catalog
    security/                   threat model, access policies, secret inventory (names only)
    runbooks/                   launch checklist, rollback, restore test, on-call notes
    api/                        OpenAPI, AsyncAPI, MCP tool schemas
  .github/workflows/            only when external CI is needed beyond Workers Builds
```

Directories are created when the tier needs them; a T0 site has no
`agents/`. The predevelopment blueprint defines what each document
contains and when it is required.

### 16.1 ADR numbering and placement

Numbers are allocated once, lab-wide, so that an ADR reference means the
same thing in every repository.

| Range                     | Holds                                                                                                                  | Lives in                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `ADR-0001` to `ADR-0015`  | One per foundation decision D1 to D15, in order, recording the project's instantiation (accepted default or deviation) | the implementing repository's `docs/adr/` |
| `ADR-0016` and upward     | Project-specific decisions with no foundation counterpart                                                              | the implementing repository's `docs/adr/` |
| `LAB-ADR-0001` and upward | Lab-wide decisions that bind every project but are not themselves foundation decisions                                 | this repository's `decisions/`             |

Rules:

- The reserved block is reserved even when empty. A project that accepts
  the D7 default still files `ADR-0007` stating that it accepted it, so the
  absence of a file always means "not yet decided" rather than "decided
  silently".
- A decision that binds more than one project is a `LAB-ADR` in the
  foundation, never an ADR inside one product. A lab-wide decision stored
  in a product repository is invisible to every other project and ships
  with that product if it is ever distributed.
- When a decision's scope grows from project to lab-wide, it is promoted:
  moved to this repository, renumbered in the `LAB-ADR` range, and its
  provenance (origin repository and commit) recorded in the file, because a
  cross-repository move cannot carry git history.
- When a `LAB-ADR` answers an open question in Section 20, the question is
  marked resolved with a pointer to it.
- Extending the foundation decision set (a new D-number) extends the
  reserved range; it does not renumber existing project ADRs.

### 16.2 Documentation platform readiness

The lab operates a public documentation platform. Publication is a status,
not an assumption: every document is internal by default, and joining the
platform is an explicit, recorded transition.

| Status      | Meaning                                      |
| ----------- | -------------------------------------------- |
| `refining`  | Under active refinement; not for publication |
| `ready`     | Reviewed and cleared; eligible to publish    |
| `published` | Live on the platform                         |

Rules:

- Readiness is tracked once, in `LAB_INDEX.md` at the workspace root, not
  duplicated into each repository and not duplicated inside this document.
- Research and UX documentation under refinement stays internal until its
  repo owner marks it ready; a living document (like this plan or a DEV-47
  style research ticket) may carry per-section readiness since sections
  finish at different times.
- A document that names private paths, orgs, people, or client details is
  published only after the identity and privacy check implied by D12 and
  Section 11.
- Git submodule and vendoring approaches to shared documentation are
  rejected: repos link to a single authoritative copy at a pinned adopted
  revision in `AGENTS.md`, they do not embed it.

Scaffold generation (roadmap Phase 5) is a template repository or a
`create` style generator that stamps this tree with the project name, tier,
and chosen dispatch model. Its implementation is out of scope here.
