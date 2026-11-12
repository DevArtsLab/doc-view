# Protection at rest

| Material                                                   | Protection                                                     | Rationale                                                                                             |
| ---------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Structured config with sensitive values, person profiles   | SOPS with an age identity; values encrypted, keys readable     | Diffable, reviewable, safe to track; the age private key is the only secret to protect                |
| The age identity itself                                    | OS keychain or a password manager; never in the workspace      | A key stored beside its ciphertext provides no protection                                             |
| Human-only material: recovery codes, personal certificates | Password manager, not the workspace                            | These are not application inputs and should not be machine-readable                                   |
| Rendered dotenv files                                      | Gitignored, treated as disposable cache, regenerated on demand | Short-lived plaintext is acceptable; permanent plaintext is not                                       |
| Live API keys with frequent rotation                       | Prefer a runtime store over committed ciphertext               | Git history preserves ciphertext permanently; "encrypted today" is only as strong as the key, forever |

Important limitation to record: encrypted-in-git patterns put ciphertext in
history permanently. If the age key leaks, every historical version is
exposed, and rewriting history does not reach forks or clones. Encryption
is not deletion. High-churn, high-value credentials belong in a runtime
store (Section 7), not in a committed file.

Remediation sequence implied by the Section 2 findings, in priority order:

1. Rotate anything that was ever stored in plaintext, on the assumption
   that plaintext-at-rest is compromised-until-rotated.
2. Move person data out of git tracking, then re-add it as SOPS ciphertext;
   treat existing history as exposed and scrub or abandon the repository.
3. Move human-only material (recovery codes, certificates) to a password
   manager.
4. Replace absolute paths in generated artifacts with root-relative
   resolution.
