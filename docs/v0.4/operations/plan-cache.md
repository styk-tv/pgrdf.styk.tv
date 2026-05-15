# Prepared-plan cache for SPARQL

> Translated SPARQL → SQL plans are cached per backend, keyed on
> the SPARQL text. Repeat invocations skip parse and translation.

## What it does

`pgrdf.sparql(q)` parses the SPARQL string through `spargebra`,
translates the algebra to dynamic SQL, prepares the SQL plan,
and executes it. The first three steps are non-trivial; the
fourth is what actually runs.

The plan cache keys on the **SPARQL text** itself. On a cache
hit, the prepared SQL plan is reused directly. The cache is
**per-backend** — each Postgres connection has its own
independent cache.

## Why you'd use it

- **REST endpoints** — hot queries fired thousands of times per
  minute pay the parse + translate cost once per connection,
  not per call.
- **Dashboards** — periodic refresh queries reuse plans without
  application-level prepared-statement gymnastics.
- **Periodic check jobs** — repeat-fired `ASK` and aggregate
  queries are near-free after the first call.

## Sizing and stats

`pgrdf.stats() -> 'plan_cache'` exposes the per-backend size,
hit count, and miss count.

```sql
SELECT pgrdf.stats() -> 'plan_cache';
--  → { "size_entries": 24, "hits": 1842, "misses": 24 }
```

Clear with `pgrdf.plan_cache_clear()` — see
[Cache control](/v0.4/operations/cache-control).

## Tests

- [`tests/regression/sql/51-plan-cache.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/51-plan-cache.sql)
  — hit/miss counters across repeat calls.
- [`tests/regression/sql/64-plan-cache-clear.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/64-plan-cache-clear.sql).
