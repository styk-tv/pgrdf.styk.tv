# Bulk ingest

> Ingest binds a single prepared `INSERT` once and re-executes it
> per batch. Large ontologies load with parse cost dominating —
> not insert cost.

## What it does

Both `pgrdf.load_turtle` and `pgrdf.parse_turtle` buffer parsed
quads into batches and flush each batch through a **prepared
statement** bound once per call. Combined with the
[shared-memory dictionary cache](/v0.5/storage/shmem-cache), this
removes the per-triple SQL roundtrip cost that dominates naïve
row-by-row ingest.

This is **Phase A** of the bulk-insert pipeline — the prepared
`INSERT` + batched-flush path. It is the shipped, v0.5.0 ingest
contract, exercised by the full test bar. Phase B (a
`heap_multi_insert` direct-heap fast path) is a **v0.6-FUTURE**
performance item: it raises throughput further but does not
change ingest correctness or the surface, so it is sequenced
after the v0.5.0 capability cut.

## Why you'd use it

- **Project managers** — operators loading 100k+ triple graphs
  into a cold instance see ingest dominated by parse time, not
  insert time. Capacity planning is straightforward.
- **Data scientists** — ad-hoc loads from notebooks finish in
  seconds for ontology-scale data.
- **Ontologists** — refresh a vocabulary in a CI pipeline without
  multi-minute ingest stalls.

## Example

```sql
-- Load a 2 MB Turtle file with default batch size; verbose
-- variant reveals the batching.
SELECT pgrdf.load_turtle_verbose('/fixtures/large.ttl', 9);
```

```json
{
  "triples":         48217,
  "dict_cache_hits": 192845,
  "dict_db_calls":   3104,
  "quad_batches":    19,
  "elapsed_ms":      812.4
}
```

`quad_batches` is `ceil(triples / batch_size)`. With the default
batch size of ~2,500, 48,217 triples fits into 19 round-trips.

## Tests

- [`tests/regression/sql/25-bulk-ingest.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/25-bulk-ingest.sql)
  — correctness of batched inserts.
- [`tests/regression/sql/52-bulk-ingest-perf.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/52-bulk-ingest-perf.sql)
  — verifies the prepared-statement plan reuse and batch
  accounting in the verbose report.

## See also

- [Verbose ingest statistics](/v0.5/storage/verbose-stats).
- [Shared-memory dictionary cache](/v0.5/storage/shmem-cache).
- [Prepared-plan cache](/v0.5/operations/plan-cache) — same idea
  for SPARQL.
