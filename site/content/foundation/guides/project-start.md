# Project start checklist

1. Classify the project into a tier (Section 5.3) and record it.
2. Create the Linear issue tree for the engagement; link the Workflow
   instance ID.
3. Instantiate ADRs for D1 to D15 from the defaults; mark any deviation.
4. Re-verify Section 13 numbers that the design depends on (record the date).
5. Produce the cost estimate (Section 12) and budget threshold for approvals.
6. Build the data classification register and retention schedule.
7. Write agent cards for every agent in scope, with tool scopes.
8. Draft the threat model from Section 14.
9. Draft `wrangler.jsonc` environments and the `previews` block (no
   production bindings in Previews).
10. Confirm Access policy for Previews and internal surfaces.
11. Create the product identity manifest (D12); confirm no brand literals
    outside it.
12. Declare the authentication and authorization model for all three planes
    before the first route (D13).
13. Register the project's configuration and secret locations in the
    central store; add no secret to the repository (D14,
    `reference/` config and secrets contracts).
14. Register the project's toggles in the administrative interface
    (Section 23), each with scope, owner, and blast radius.
15. Complete guides/predevelopment.md exit criteria; then development begins.

---
