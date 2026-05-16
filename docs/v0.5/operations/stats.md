# `pgrdf.stats()` — operator observability

> One UDF returns a JSONB snapshot of internal state: dictionary
> cache size and hit rate, prepared-plan cache size, last-run
> ingest stats, build metadata.

## What it does

`pgrdf.stats() → JSONB` is the stable health surface for pgRDF.
The returned shape is locked by regression test
[`82-stats-shape.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/82-stats-shape.sql),
so downstream Prometheus exporters / pg_stat_statements pipelines
/ dashboards can rely on the key set staying stable across
patch releases.

## Why you'd use it

- **Operators** — a single SQL call surfaces internal state.
  Scrape it on an interval; build SLOs over the keys.
- **Developers** — quick sanity check during local development
  that the extension is wired correctly.

## Example

```sql
SELECT pgrdf.stats();
```

```json
{
  "version":              "0.5.0",
  "shmem_dict_cache": {
    "size_entries":   12480,
    "capacity":       65536,
    "lookups_total":  189342,
    "hits":           181004,
    "misses":         8338,
    "hit_rate":       0.9560
  },
  "plan_cache": {
    "size_entries":   24,
    "hits":           1842,
    "misses":         24
  },
  "ingest_last": {
    "triples":        48217,
    "elapsed_ms":     812.4
  }
}
```

## Tests

- [`tests/regression/sql/82-stats-shape.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/82-stats-shape.sql)
  — JSONB key contract.

## See also

- [Cache control](/v0.5/operations/cache-control).
- [Prepared-plan cache](/v0.5/operations/plan-cache).
- [Shared-memory dictionary cache](/v0.5/storage/shmem-cache).
