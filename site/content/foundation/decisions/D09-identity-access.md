# D9. Identity and access

Default: Cloudflare Access in front of every Preview, internal tool, and
admin surface; Access identity propagated as the approver identity in
Workflow gates; API tokens scoped per Worker for CI and agents. Client
end-user authentication is a per-project ADR (OpenAuth on KV is the noted
reference pattern).
