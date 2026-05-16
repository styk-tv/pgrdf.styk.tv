---
title: clear_graph — empty a graph without dropping the partition
description: pgrdf.clear_graph(id) TRUNCATEs ONLY the per-graph partition, preserving the partition shell and the _pgrdf_graphs IRI binding.
---

# `clear_graph` — empty a graph in place

> Wipe every quad in a named graph without dropping the partition
> shell or the IRI binding. Subsequent inserts route into the
> same partition.

## What it does

```
pgrdf.clear_graph(id  BIGINT) → BIGINT
pgrdf.clear_graph(iri TEXT)   → BIGINT
```

The IRI overload (shipped in v0.5.0) resolves `iri` through
`_pgrdf_graphs` and delegates to the id form.

Issues `TRUNCATE ONLY pgrdf._pgrdf_quads_g<id>` against the
per-graph LIST partition. Returns the row count captured
immediately before the TRUNCATE (== the number of rows wiped).

Both base (`is_inferred = FALSE`) and inferred
(`is_inferred = TRUE`) rows go in the same pass — `clear_graph`
is not `is_inferred`-discriminating.

Unlike [`drop_graph`](/v0.5/storage/drop-graph), the partition
table and the `_pgrdf_graphs` IRI binding **both survive**.
After `clear_graph(N)`:

- `pgrdf.count_quads(N)` → 0
- `pgrdf.graph_iri(N)` → still resolves to the bound IRI
- A subsequent `pgrdf.parse_turtle(..., N)` routes into the same
  partition without falling back to `_pgrdf_quads_default`.

## Why you'd use it

- **Project managers** — periodic data refresh cycles where the
  graph identity (IRI) stays stable but the contents are
  recomputed each run.
- **Data scientists** — reset a working graph between experiment
  iterations without breaking external references that named the
  graph by IRI.
- **Ontologists** — wipe an instance graph before reloading a
  fresh snapshot of the data while keeping the same shapes graph
  + IRI mapping in place.
- **Backend engineers** — idempotent cleanup primitive. Call
  blindly during error recovery without first probing partition
  existence (it returns 0 on absent graphs, no error).
- **Operators** — `TRUNCATE` runs metadata-fast on the
  partition, not as a row-by-row delete.

## Example

```sql
-- Refresh a daily data graph
SELECT pgrdf.clear_graph(700);                   -- → 12,308 (rows wiped)
SELECT pgrdf.load_turtle('/feed/today.ttl', 700);
SELECT pgrdf.materialize(700);

-- The IRI binding is unchanged
SELECT pgrdf.graph_iri(700);
--  → http://example.org/feed/daily   (preserved across the clear)

-- Idempotent on absent
SELECT pgrdf.clear_graph(9_999_999);             -- → 0 (no error)
```

`graph_id = 0` (the default partition) is **permitted** —
unlike `drop_graph(0)` which is refused. Clearing `0` empties
the explicit `_pgrdf_quads_g0` partition if `add_graph(0)` was
ever called, or returns 0 (idempotent miss path).

## Stable error prefixes

| Trigger | Prefix |
|---|---|
| Negative `id` | `clear_graph: graph_id must be >= 0` |

## Internal detail — why `TRUNCATE ONLY`

The implementation uses `TRUNCATE ONLY`, not bare `TRUNCATE`.
`ONLY` blocks cascade to any descendant partitions. The per-graph
partitions have no children today, but `ONLY` future-proofs against
a sub-partitioning slice that might silently widen scope.

## Tests

- [`tests/regression/sql/89-clear-graph.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/89-clear-graph.sql)
  — happy path, idempotent absent, clear-twice, `graph_id = 0`
  permitted, negative-id guard, partition + IRI binding survival.
- [`tests/regression/sql/92-lifecycle-end-to-end.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/92-lifecycle-end-to-end.sql)
  — isolation under a shared dictionary cache.

## See also

- [Lifecycle UDFs overview](/v0.5/storage/lifecycle).
- [`drop_graph`](/v0.5/storage/drop-graph) — when you want the
  partition + IRI gone too.
- [Per-graph LIST partitions](/v0.5/storage/graph-partitions).
