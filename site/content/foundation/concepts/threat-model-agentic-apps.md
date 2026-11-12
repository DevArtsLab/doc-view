# Threat model for agentic applications

Threats specific to agent-driven systems, with the foundation control that
addresses each. The lab-wide baseline (repository classes, assets,
attackers, owner decisions) is `concepts/threat-model-lab.md` in the foundation repo; projects
extend both in `docs/security/threat-model.md`.

| Threat                                   | Vector                                                                  | Foundation control                                                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt injection via retrieved content   | Web pages, documents, emails fed to the model                           | Tool allow-lists per agent; human approval for client-visible outputs and spend; AI Gateway Guardrails                                                           |
| Tool misuse or privilege escalation      | Agent calls a tool outside its intended scope                           | MCP least-privilege scopes; OAuth-secured MCP servers; audit of every tool call                                                                                  |
| Data exfiltration through generated code | Code attempts outbound network calls                                    | Dynamic Workers with egress blocked; Containers with internet disabled; Outbound Worker in WfP                                                                   |
| Secrets exposure to the model or sandbox | Credentials in prompts or sandbox environment variables                 | Secrets stay in the Worker; Secrets Store bindings; no secrets in agent context (Principle 7)                                                                    |
| Cross-tenant data leakage                | Shared cache, shared DO, or shared D1 across clients                    | Per-tenant DO or database; WfP untrusted mode; classification-driven access rules                                                                                |
| Runaway cost                             | Loops, retries, abusive public callers                                  | `limits.cpu_ms`; AI Gateway spend limits; rate limiting; Queues retry caps (100)                                                                                 |
| Replay or duplicate side effects         | Workflow step retried after a committed external write                  | Intent-before-effect rule; idempotency keys; retries re-read state                                                                                               |
| Unaudited state change                   | Direct writes bypassing the audit path                                  | Tail Worker on every Worker; application events for data access; review flag for direct REST writes                                                              |
| Preview exposure                         | Public Preview URL with real data                                       | Access on all Previews; no production bindings in Previews                                                                                                       |
| Supply chain                             | Compromised dependency or brand-new package version                     | Lab rule: prefer versions published at least 7 days ago; lockfiles; pre-push review                                                                              |
| Third-party terms violation              | An agent or job accesses a source whose terms restrict automated access | Source cards declare a dated terms status (allowed, restricted, forbidden, unknown); forbidden sources are import-only; per-source rate limits and kill switches |
| Memory and context poisoning             | Untrusted or inferred facts silently become authoritative               | Facts carry trust level and provenance; quarantined until human-promoted; invalidation preserves history instead of overwriting                                  |
| Over-trust in sandbox claims             | Assuming isolation that the runtime does not provide                    | Read the Workers security model and sandbox security docs before each new execution pattern                                                                      |
| Unauthenticated public agent ingress     | Anonymous visitors driving model spend or extracting internal content   | Per-session rate and token caps; Turnstile on ingress; agent context limited to public information; AI Gateway spend limits, rate limiting, and Guardrails       |

Projects that operate agents should also map their threat model to the
OWASP Top 10 for Agentic Applications: goal hijack, tool misuse, identity
and privilege abuse, agentic supply chain, unexpected code execution,
memory and context poisoning, insecure inter-agent communication,
cascading failures, human-agent trust exploitation, and rogue agents. The
waykeeper repository carries a worked mapping (its Section 10) that a
project can lift as the starting table.
