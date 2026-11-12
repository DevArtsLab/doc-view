# Upstream component sources

Rules for importing external component corpora into the lab registry
(D11). Source identities, terms, and verdicts live in
`reference/upstream-sources.yaml`, cited as `upstream:<id>`. Mirrors
the source-card rule in `reference/guardrails.md`; forbidden sources
are import-never, not silently skipped.

Convention: sources are upstream; components are imported, owned, and
evolved by the lab. Upstream is never a runtime dependency.

Per-source evaluation notes live outside platform docs:
`../research/foundation/component-sources/`.

## Evaluation checklist

Every candidate source, paid included: license review before purchase
or import; non-permissive code never reaches the public registry tier.

1. Entry added to `reference/upstream-sources.yaml` (name, kind, repo,
   license, terms, verdict); docs cite `upstream:<id>`, restate no
   locator.
2. Corpus inventoried against registry gaps, not novelty.
3. Framework coupling counted; extraction cost stated.
4. Vendor egress and upsell artifacts listed for strip.
5. Identity literals mapped to the manifest (D12).
6. Primitive runtime: Radix is the lab standard (owner decision
   2026-11-11); upstream primitives on another runtime convert to Radix
   on import. Any other runtime entering the registry needs an ADR.
