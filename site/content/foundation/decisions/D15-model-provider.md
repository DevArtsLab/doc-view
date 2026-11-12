# D15. Model provider and local inference policy

Default for lab and delivery engineering work: the Devin team-plan quota is
the primary agent capacity. A local model (Ollama or equivalent) is used
only when that quota is exhausted.

| Rule                 | Statement                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Primary              | Devin sessions, within the team plan, for agentic development and research work                                                  |
| Fallback             | Local inference engages only on quota exhaustion, not as a cost optimization and not as a default                                |
| Never silent         | Switching providers is an explicit, visible, administered state change (Section 23), and emits an audit event                    |
| Product inference    | In-app AI calls route through AI Gateway (Section 4.4) with spend limits, independent of the engineering-capacity policy above   |
| Self-hosted products | Products distributed to users may run local inference as their primary path when a project ADR says so (career-tracker ADR-0016) |

Rationale: quality of agentic engineering output is the constraint that
matters most, and a local fallback that activates quietly would degrade it
without anyone noticing. Visibility is the point, which is why this
decision depends on Section 23 rather than on a code-level fallback chain.
