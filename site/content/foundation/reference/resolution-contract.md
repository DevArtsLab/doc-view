# Resolution contract

Precedence, first hit wins. This mirrors the chain already proven in the
RTS repository:

| Order | Source                                                             | Use                                                  |
| ----- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| 1     | Explicit flag or argument                                          | One-off overrides and tests                          |
| 2     | `DEVARTSLAB_HOME` (generically: `<LAB>_HOME`) environment variable | Containers, CI, non-standard layouts                 |
| 3     | Upward search for `.workspace.json` from the current directory     | The normal path; works from any depth in any project |
| 4     | A single existing candidate in a conventional location             | Convenience for fresh machines                       |

Rules:

- No tool, template, generated artifact, or scheduler entry may contain an
  absolute path to the store. The current scheduler job in
  agent-research-kit violates this and is the reference case for the fix.
- Resolution failure is a hard error with a remediation message, never a
  silent fallback to a default or an empty value (foundation principle 13).
- The root marker carries a schema version so the layout can migrate.
