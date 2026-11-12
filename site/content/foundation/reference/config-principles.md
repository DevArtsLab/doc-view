# Config and secrets principles

| #   | Principle                                              | Consequence                                                                                     |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | Repositories hold references, never values             | A repository may name `GOOGLE_CLIENT_SECRET`; it may never contain it                           |
| 2   | One store per plane                                    | Local has exactly one root store; each deployed environment has exactly one authoritative store |
| 3   | Resolution is relative, never absolute                 | Paths resolve from a discovered workspace root, so the tree is movable                          |
| 4   | Encrypted at rest, decrypted at use                    | Plaintext exists in memory for the life of a process, not on disk indefinitely                  |
| 5   | PII is never committed anywhere                        | Including private and remote-less repositories; a remote can always be added later              |
| 6   | Every secret has an owner, scope, and rotation trigger | Unowned credentials are the ones that outlive their purpose                                     |
| 7   | Least privilege for agents                             | An agent receives the narrowest scope for the task, and never a store-wide key                  |
| 8   | Inventory is generated, not remembered                 | A registry lists what exists and where, by name only                                            |
