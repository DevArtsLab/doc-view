# D8. Secrets

Default: Worker secrets for single-Worker credentials; Secrets Store for
shared credentials (AI provider keys used by AI Gateway and multiple
Workers); `.dev.vars` locally. Staged secret changes use the versions
workflow. Rotation is a Workflow step with an audit event.
