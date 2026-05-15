# Shared-memory dictionary cache

> The dictionary `id ↔ term` mapping is mirrored in PostgreSQL
> **shared memory** across backends. Repeated ingest of the same
> IRIs becomes a memory lookup, not a SQL roundtrip.

## What it does

Every ingest call must resolve each parsed term to its
`_pgrdf_dictionary` id (or insert it). A naïve implementation
issues a SELECT-then-INSERT per term. The shared-memory cache:

1. **Mirrors** committed dictionary rows in a fixed-size LRU
   table allocated in Postgres shared memory at extension init.
2. **Serves hits** without touching the underlying SQL table.
3. **Stages** new terms in a per-transaction buffer; on COMMIT
   they're promoted to the shared cache for other backends.

The same IRIs (`rdf:type`, `rdfs:subClassOf`, FOAF predicates)
appear thousands of times in any real ontology — cache hit rates
of 95 %+ are typical after the first load.

## Why you'd use it

- **Project managers** — throughput scales with cache hit rate.
  The verbose-ingest report shows the rate empirically; capacity
  planning is straightforward.
- **Data scientists** — loading multiple ontologies that share
  vocabulary terms (FOAF, RDFS, OWL) is dramatically faster
  after the first one warms the cache.
- **Operators** — `pgrdf.shmem_reset()` provides explicit
  invalidation around schema/extension upgrades.

## Example

```sql
-- Inspect cache size and hit/miss counters.
SELECT pgrdf.stats() -> 'shmem_dict_cache';
--  → {
--     "size_entries":   12480,
--     "capacity":       65536,
--     "lookups_total":  189342,
--     "hits":           181004,
--     "misses":         8338,
--     "hit_rate":       0.9560
--   }

-- Force invalidation (rarely needed; used by migration scripts).
SELECT pgrdf.shmem_reset();
```

## How it works

The cache lives in a `LWLockable` hash table sized at extension
startup. Insert path:

1. Parser produces a term.
2. Cache lookup. **Hit** → use the cached id.
3. **Miss** → consult `_pgrdf_dictionary`; if absent, allocate a
   new row in the transaction-local stage buffer.
4. On `COMMIT`, the staged buffer is inserted into
   `_pgrdf_dictionary` and promoted into the shared cache.

This makes the dictionary update visible to other backends only
once the inserting transaction commits — preserving Postgres'
read-committed semantics for graph workloads.

See
[`SPEC.pgRDF.LLD.v0.4 §4.1`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
for the full design.

## Tests

- [`tests/regression/sql/50-shmem-dict-cache.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/50-shmem-dict-cache.sql)
  — hit-rate growth across repeated loads.
- [`tests/regression/sql/63-shmem-reset-invalidation.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/63-shmem-reset-invalidation.sql)
  — `shmem_reset` clears counters and entries.

## See also

- [Verbose ingest statistics](/v0.5/storage/verbose-stats).
- [Cache control](/v0.5/operations/cache-control).
- [pgrdf.stats() observability](/v0.5/operations/stats).
