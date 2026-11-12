# Deliberately excluded

- Vendor-neutral abstraction layers over bindings: bindings are already the
  portability seam; extra indirection adds cost without benefit.
- General-purpose containers for every workload: Containers and Sandbox are
  used only where Workers primitives do not fit.
- Agent autonomy without audit: no phase transition, client-visible output,
  or spend happens outside the guardrail path.
- Pages for new projects.
- A permanent staging environment by default: Previews cover branch testing;
  staging exists only under contract.
- GitHub Issues for tracking: Linear is the source of truth.
- Code and configuration in this document.
