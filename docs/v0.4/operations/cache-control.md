# Cache control

> Explicit invalidation for the shared-memory dictionary cache
> and the prepared-plan cache.

## What it does

`pgrdf.shmem_reset()` clears the
[shared-memory dictionary cache](/v0.4/storage/shmem-cache),
resetting size, counters, and entries.

`pgrdf.plan_cache_clear() → BIGINT` clears the
[prepared-plan cache](/v0.4/operations/plan-cache) and returns the
count of plans that were cleared.

Both are designed as **explicit, deliberate** operations — there's
no automatic invalidation on schema change. Migration scripts and
operators control the timing.

## Why you'd use it

- **Test harnesses** — guarantee a fresh state at test start.
- **Migration scripts** — invalidate caches after schema or
  extension version changes.
- **Operators** — explicit recovery from corrupt cache state
  (rare, but a safety valve).

## Example

```sql
-- Before a critical benchmark run.
SELECT pgrdf.shmem_reset();
SELECT pgrdf.plan_cache_clear();
--  → 24   (number of plans evicted)

-- Confirm.
SELECT pgrdf.stats();
-- shmem_dict_cache.size_entries → 0
-- plan_cache.size_entries       → 0
```

## Tests

- [`tests/regression/sql/63-shmem-reset-invalidation.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/63-shmem-reset-invalidation.sql)
- [`tests/regression/sql/64-plan-cache-clear.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/64-plan-cache-clear.sql)
