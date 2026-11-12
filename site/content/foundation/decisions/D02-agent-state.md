# D2. Agent state model

| Option | Model                                                      | Choose when                         |
| ------ | ---------------------------------------------------------- | ----------------------------------- |
| A      | Durable Object per agent session plus Workflow per process | Always for production agent work    |
| B      | Stateless calls with context passed each time              | Only one-shot, read-only assistance |

Default: A. One Agents SDK Durable Object per session owns mutable state in
SQLite; one Workflow per business process owns multi-step execution. Rules:
no step mutates external state before writing its intent to durable storage;
retries re-read state rather than re-executing blindly; long-running work
checkpoints after every phase; `runFiber` and `stash` are used for work that
must survive Durable Object eviction.
