---
title: drop_graph — partition-level graph removal
description: pgrdf.drop_graph(id, cascade) detaches the LIST partition, drops it, removes the _pgrdf_graphs row, and returns the pre-drop triple count.
---

# `drop_graph` — partition-level graph removal

> Remove an entire named graph in one call. DETACH + DROP the
> LIST partition, prune the `_pgrdf_graphs` row, return the
> pre-drop triple count.

## What it does

```
pgrdf.drop_graph(id BIGINT, cascade BOOLEAN DEFAULT TRUE) → BIGINT
```

1. `ALTER TABLE pgrdf._pgrdf_quads DETACH PARTITION pgrdf._pgrdf_quads_g<id>`
2. `DROP TABLE pgrdf._pgrdf_quads_g<id>`
3. `DELETE FROM pgrdf._pgrdf_graphs WHERE id = <id>`
4. Returns the row count that was in the partition immediately
   before the detach.

`cascade => FALSE` errors with the stable
`drop_graph: inferred rows present` prefix if **any**
`is_inferred = TRUE` row exists in the partition. `cascade => TRUE`
(the default) drops base and inferred rows together — there's
nothing left for a subsequent `materialize` to rebuild against
because the source is gone too.

## Why you'd use it

- **Project managers** — tenant offboarding, snapshot pruning,
  GDPR-style erasure: a graph removal is one SQL call, returns
  the row count for audit.
- **Data scientists** — clean up scratch graphs from an
  exploratory notebook session without leaving stale partitions
  behind.
- **Ontologists** — drop an obsolete vocabulary version once its
  consumers have migrated.
- **Backend engineers** — programmatic graph lifecycle: error
  prefix is stable, so client code can branch on
  `drop_graph: inferred rows present` without substring guessing.
- **Operators** — partition removal is partition-DDL bounded, not
  a row scan; cost is metadata-time, not data-time. The DETACH
  takes an `ACCESS EXCLUSIVE` lock on `_pgrdf_quads` for a
  metadata window, then the DROP runs against the detached child.

## Example

```sql
-- Happy path
SELECT pgrdf.drop_graph(42);
--  → 1832    (the pre-drop triple count)

-- Idempotent on absent
SELECT pgrdf.drop_graph(999);
--  → 0       (no error; no-op if partition doesn't exist)

-- Refuse to drop inferred-bearing partition without cascade
SELECT pgrdf.materialize(100);   -- writes inferred rows
SELECT pgrdf.drop_graph(100, cascade => FALSE);
-- ERROR:  drop_graph: inferred rows present (n=1042 in graph_id=100);
--         re-call with cascade => TRUE to drop them too

-- Cascade drops both
SELECT pgrdf.drop_graph(100, cascade => TRUE);
--  → 3261    (base + inferred combined)
```

## Stable error prefixes

| Trigger | Prefix |
|---|---|
| Inferred rows present and `cascade => FALSE` | `drop_graph: inferred rows present` |
| Negative `id` | `drop_graph: graph_id must be >= 0` |
| `id = 0` (the catch-all default partition) | `drop_graph: cannot drop default partition` |

The default partition (`graph_id = 0`) is the bucket every
unrouted INSERT lands in; dropping it would prevent recovery
from a mis-routed load and is therefore outright refused.

## Post-conditions

After `drop_graph(N)`:

- `pgrdf.count_quads(N)` → 0 (the partition is gone).
- `pgrdf.graph_iri(N)` → NULL.
- `pgrdf.graph_id('<former-iri>')` → NULL.
- The `_pgrdf_graphs` row for `N` is gone.
- A subsequent `pgrdf.add_graph(N)` or
  `pgrdf.add_graph(N, '<new-iri>')` re-allocates from scratch.

## Tests

- [`tests/regression/sql/88-drop-graph.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/88-drop-graph.sql)
  — six invariants: idempotent absent, happy path with triple
  count, cascade-FALSE-inferred guard, cascade-TRUE-inferred
  override, default-partition guard, negative-id guard.
- [`tests/regression/sql/92-lifecycle-end-to-end.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/92-lifecycle-end-to-end.sql)
  — load → copy → drop round-trip.

## See also

- [Lifecycle UDFs overview](/v0.5/storage/lifecycle).
- [`clear_graph`](/v0.5/storage/clear-graph) — when you want to
  empty the graph but keep the partition shell and IRI binding.
- [`move_graph`](/v0.5/storage/move-graph) — composes `copy_graph` +
  `drop_graph` for atomic relabeling.
