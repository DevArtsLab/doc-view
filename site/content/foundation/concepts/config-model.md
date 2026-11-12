# Configuration, PII, and secret architecture: rationale and baseline

The lab's volume is growing faster than ad hoc practice can hold. Four
requirements drive the architecture:

1. **Repository deletion must be non-destructive.** Removing a local
   checkout must never destroy credentials, because gitignored secrets are
   invisible to every backup that follows the repository.
2. **The workspace must be portable.** Moving the workspace root to another
   user profile, machine, or container must preserve every secret and break
   no path.
3. **Nothing brand-specific or person-specific may be hardcoded.** Per
   foundation D12, identity is a variable; the same applies to the operator's
   personal data.
4. **Agents operate this estate.** Unattended agents read configuration and
   must never be able to read a credential they do not need, or leak one
   into a prompt, a log, or a commit.

## 2. Estate observations

Workspace estate audit 2026-10-25:
`../research/foundation/config-audit-2026-10-25.md`. Cross-cutting findings from the
platform inventory (current table: `reference/platform-inventory.md`):

- At least eight independent runtime stores: without a declared source of
  truth, rotation is guesswork. The strongest argument for the Tier 2
  model (secrets-tiers).
- GitHub Actions variables and GitHub Actions secrets are different
  stores with different protections; confusing them is a common quiet
  leak.
- Prefer OIDC and short-lived credentials wherever a platform offers
  them: a credential that does not persist cannot be exfiltrated later.

Convention adopted from the audit: the RTS precedence chain, lifted
verbatim: explicit flag, then environment variable, then an
active-context file, then a single existing candidate.
