# D11. Design system and component distribution

Default: shadcn/ui (`upstream:shadcn-ui`) on Tailwind CSS. Components are copied into the
repository and owned by the lab, not consumed as a black-box dependency, so
every app can evolve them without forking a vendor.

| Option                            | Why not the default                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Atlassian Design System           | Strong for dense table and form workloads, but enterprise-opinionated, heavy, and hard to rebrand per client (conflicts with D12) |
| MUI, Chakra, Mantine              | Runtime weight and a recognizable generic look; theming fights the library instead of using it                                    |
| Radix or Base UI with bespoke CSS | Maximum control, but rebuilds what shadcn already provides; more agent effort per component                                       |
| Hand-written CSS per app          | No leverage; this is the state being retired                                                                                      |

Deciding requirements, in order: components must be ownable and reusable
across every lab app and client product (D12); the stack must be
rebrandable through tokens rather than overrides; and the component corpus
must be one that code-generating agents write fluently, because frontend
work is agent-assisted by design (Section 15).

Distribution is the load-bearing half of this decision. The lab runs its
own private shadcn registry so one component set serves every application:

- A namespaced registry (for example `@devartslab`) is declared in each
  project's `components.json`; components install with
  `npx shadcn@latest add @devartslab/<item>`.
- Registries are authenticated with a bearer token, API key, basic-auth, or
  query-param credential supplied through an environment variable (`${VAR}`
  expansion in `components.json`), never committed (see D14). Public GitHub
  registries also work as `owner/repo` sources with no `components.json`
  entry; private GitHub repos authenticate through `gh` or `GH_TOKEN`.
  Namespaces allow a public tier, an internal tier, and a client-licensed
  tier side by side.
- A registry item can carry components, hooks, pages, config, AI prompts,
  and agent rules, so the registry distributes conventions and not only UI.
- Community registries from the shadcn Registry Directory may be used for
  advanced surfaces, subject to the supply-chain rule in Section 14: review
  the code on install and prefer versions published at least 7 days ago.

Any other design system or component library requires an ADR naming the
specific use case it serves and why the lab registry cannot.
