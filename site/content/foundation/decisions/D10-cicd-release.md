# D10. CI/CD and release

Default: Workers Builds connected to the repository; Previews per branch;
production deploy on merge to main with human approval in the Workflow gate;
gradual deployments for lab-owned Workers (not available in WfP namespaces,
where rollout is implemented in the dispatch Worker); rollback rehearsed
before launch with the understanding that data is not rolled back.
