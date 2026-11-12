# D12. Product identity and white-label readiness

Default: no business name, brand string, domain, legal entity, or contact
address is hardcoded anywhere in code, configuration, documentation
templates, email bodies, or UI. All of it resolves from one identity
manifest per product.

The requirement this satisfies: if the lab operates under a new name, or a
new venture starts, the accumulated research, design, code, and
documentation must be reusable without recreation. `devartslab` is a
variable, not a constant.

| Concern                 | Rule                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity manifest       | One file per product resolves legal name, display name, slug, primary domain, email domain, support addresses, social handles, logo and favicon asset paths, theme tokens, and license holder |
| Code and UI             | Read identity through a typed accessor; literal brand strings in components are a review failure                                                                                              |
| Theme                   | Brand expression lives in design tokens (D11), so rebranding is a token swap plus an asset swap                                                                                               |
| Documents and templates | Rendered from the manifest, following the existing org and consultant template pattern already proven in the RTS repository                                                                   |
| Infrastructure          | Domains, account names, and bucket or database names are derived from the slug, never typed twice                                                                                             |
| Verification            | A CI check greps the tree for forbidden literals (current business name, current domain) outside the manifest and asset files                                                                 |

Consequence: the scaffold generator (Phase 5) takes the identity manifest
as its primary input. The same generator produces a lab product and a
client-branded product from identical sources.

Reference implementation: the waykeeper repository's
`config/brand/names.yaml` is a working identity manifest: stable
brand-neutral ids as keys, human-facing labels as values, `{{names...}}`
tokens in source documents, a generated glossary, and a brand-neutral
skill prefix so ids survive a rename.
