# D7. Observability pipeline

Default: Workers Logs and Traces enabled on every Worker; one lab Tail
Worker attached to every Worker for the audit trail (Appendix B); Logpush to
R2 for retention beyond 7 days; Analytics Engine for metering. OTel export
is evaluated per client when they operate their own observability stack.
