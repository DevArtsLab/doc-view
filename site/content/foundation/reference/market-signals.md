# Market signals and alignment contract

> Lab-wide market alignment contract, revision 2.
> What the lab collects to prove positioning; how roadmaps, resumes, and
> pitches stay aligned.
>
> **Last scan:** 2026-11-02 (DEV-125 monthly pass + browser-automation
> evidence; baseline 2026-10-28)
> **Driver:** Linear DEV-125 (living research ticket)
> **Decay policy:** every fact carries a date + source. Facts older than 2
> quarters are stale until re-verified by the next DEV-125 pass.
> **Signal data:** `../research/foundation/market-signals.md` (verified corpus,
> keyword watchlist, measured outcomes, source registers).

## Status

Living document. Does NOT self-update. Refresh path:

1. DEV-125 pass reruns the bounded web scan (3-6 queries: hiring keywords,
   exec-valued engineering metrics, AI/agentic market numbers).
2. Findings updated in place in DEV-125; decayed claims marked
   `(stale, replaced by X)`.
3. Deltas synced to the signal corpus (`../research/foundation/market-signals.md`)
   and into Linear doc "Contribution Ledger: Conventions + Stats" ->
   Market signal lens.
4. Cadence: monthly while applications/partnerships are active, quarterly
   otherwise.

## Collection contract (what every ledger entry must carry)

`## Impact` numbers draw from this set, not ad-hoc counts:

- deploys/week, lead time, cycle time
- change failure rate, MTTR, uptime, p99 latency
- review turnaround, PR revert rate (DX 2026: the AI-era bottlenecks)
- tests added/passing, coverage delta
- endpoints live, users served, records processed
- cost saved or unit-cost basis (RpE proxy where estimable)
- time saved vs manual baseline (AI ROI narrative)
- automation work: hours of capacity/year, cycle time before/after,
  exceptions per 1,000 runs, payback months

`## Evidence` is mandatory: every number links to a click-verifiable source
(commit SHA, PR, live URL, dashboard).

Work descriptions tag market vocabulary on the way in (agentic AI, MCP
server, RAG, evals, guardrails, platform engineering, edge/serverless,
FinOps, UI automation, Selenium / WebDriver BiDi, API integration, Python
process automation) so label-and-keyword queries surface the right bullets.

## Alignment rules (bind every lab product + pitch)

1. Position as SDLC-wide orchestration (plan, build, test, deploy, observe),
   never codegen-only. Matches where Bain says real returns come from.
2. Lead every product story with a quantified scorecard: cadence, failure
   rate, time saved, cost basis. This is the artifact execs say is missing.
3. Resume/ledger framing maps each bullet to DORA/SPACE/Core 4 vocabulary
   first, proprietary terms second.
4. Vision/mission framing: healthy growth = measurable leverage per
   engineer, not headcount. We sell orchestration and verified impact.
5. New roadmap items check the keyword watchlist (signal corpus): does the
   item compound an in-demand signal or chase a decaying one? Note the
   answer in the issue.
6. Automation work is framed as integration (UI when no API, API when one
   exists) with capacity hours and cycle-time deltas, never as "scripting".
