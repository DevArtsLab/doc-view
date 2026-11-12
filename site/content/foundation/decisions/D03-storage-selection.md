# D3. Storage selection

Default: D1 for relational and reporting data; Durable Object SQLite for
per-entity state; R2 for files and artifacts; KV only for read-heavy
configuration. Hyperdrive only when a client brings an existing database.
Vectorize only after AI Search is shown insufficient. Change triggers: a
single dataset projected above 10 GB (split D1 or use Hyperdrive), write
rates above 1 per second per key (KV is wrong), need for strict ordering
(Durable Object).
