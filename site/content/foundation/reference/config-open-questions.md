# Config and secrets: research strategy and open questions

Re-verification cadence, following the reference/research-policy.md decay policy:

| Class                                                      | Re-verify |
| ---------------------------------------------------------- | --------- |
| Secrets Store beta status and product integrations         | Monthly   |
| Platform pricing and plan gates for secret features        | Quarterly |
| Breach and advisory status for every platform in Section 9 | Monthly   |
| The inventory itself (has a new store appeared?)           | Quarterly |

Research tasks, in dependency order:

1. Validate the Section 4 tree and the Section 5 resolution chain on a
   second machine or container, since portability is the central claim and
   is currently untested.
2. Prove the Tier 2 to Tier 3 sync for one real credential end to end,
   including rotation, before generalizing.
3. Measure the operational cost of SOPS plus age for an operator working
   alone, and decide whether a runtime store is warranted yet or is
   premature infrastructure.
4. Decide the inventory generator's source: derived from the store, or a
   declared manifest validated against it.
5. Define the agent scoping model concretely: which tier an unattended
   agent may reach, and how a per-task scope is issued and expires.

Open questions:

| ID  | Question                                                                                                                                               | Needed by                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| S1  | Does a single cross-platform runtime store (Infisical) earn its operational cost, or is SOPS plus platform-native stores sufficient at current volume? | Before the estate exceeds a maintainable number of projects |
| S2  | Does the lab adopt a password manager as the formal Tier 1, or continue with the OS keychain?                                                          | Before the next credential rotation cycle                   |
| S3  | Secrets Store is in open beta and Workers-and-AI-Gateway-scoped; what is the fallback if it does not reach GA on the needed timeline?                  | Phase 2 design                                              |
| S4  | What is the retention and scrub plan for repositories whose history already contains PII or plaintext secrets?                                         | Immediately; history is permanent                           |
| S5  | How are secrets handled for Previews, given that Preview isolation is only real when the previews block declares its own resources?                    | Phase 1 exit                                                |
| S6  | Does the lab need per-client credential isolation (separate vaults or accounts per client) before the first Workers for Platforms client?              | Phase 4 design                                              |
