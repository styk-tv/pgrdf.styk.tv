---
title: move_graph — relabel a graph atomically
description: pgrdf.move_graph(src, dst) composes copy_graph + drop_graph in the caller's transaction to migrate every quad from src to dst.
---

# `move_graph` — relabel a graph atomically

> Migrate every quad from one graph to another and remove the
> source. Composes `copy_graph` + `drop_graph` in the caller's
> transaction. Returns the count of triples moved.

## What it does

```
pgrdf.move_graph(src BIGINT, dst BIGINT) → BIGINT
pgrdf.move_graph(src TEXT,   dst TEXT)   → BIGINT
```

The IRI overload (shipped in v0.5.0) resolves both `src` and
`dst` through `_pgrdf_graphs` and delegates to the id form.

Internally:

1. `pgrdf.copy_graph(src, dst)` — copies every row.
2. `pgrdf.drop_graph(src, cascade => TRUE)` — removes the source.

Both halves run in the **calling statement's transaction**, so a
rollback unwinds both. Returns the count of triples moved
(== `copy_graph`'s return value at step 1).

::: tip Implementation note
The W3C SPARQL 1.1 Update `MOVE` operation is semantically a
metadata-only DETACH + rebind + ATTACH against the LIST
partition. pgRDF ships the compose strategy: every row's
`graph_id` column would need updating to satisfy a post-rebind
LIST constraint check (itself a row scan), so a "true
metadata-only swap" isn't a win on this schema. A constant-time
partition-rebind path is a v0.6-FUTURE perf optimisation — the
v0.5.0 compose strategy is correct and transactional today.
:::

## Why you'd use it

- **Project managers** — atomic snapshot promotion: stage a new
  version into a scratch graph; `move_graph(scratch, prod)`
  flips it into production in one statement.
- **Data scientists** — final step of a staging → validate →
  publish pipeline. The `move_graph` call commits with the rest
  of the pipeline's transaction.
- **Ontologists** — promote a working-copy graph to the
  canonical IRI once its inferences and validations check out.
- **Backend engineers** — single SQL call, well-defined error
  surface, transactional semantics.
- **Operators** — failure modes are bounded: dst-non-empty
  guard runs **before** the copy starts, so a bad call costs O(1).

## Example

```sql
-- Setup: stage a new ontology version
SELECT pgrdf.add_graph(900, 'http://example.org/ontology/v3.7-staging');
SELECT pgrdf.parse_turtle('@prefix ex:<http://e.com/>. ex:X ex:Y ex:Z.', 900);
--  → 1

-- Drop the old production graph (idempotent if absent)
SELECT pgrdf.drop_graph(100);
--  → 0   (or however many rows the old version held)

-- Atomic relabel
BEGIN;
  SELECT pgrdf.move_graph(900, 100);
  --  → 1
  SELECT pgrdf.add_graph(100, 'http://example.org/ontology/v3.7');
COMMIT;

-- Post-conditions
SELECT pgrdf.count_quads(100);     -- → 1
SELECT pgrdf.count_quads(900);     -- → 0 (partition gone)
SELECT pgrdf.graph_id('http://example.org/ontology/v3.7-staging');
--  → NULL    (the source IRI binding was removed by drop_graph)
```

## Stable error prefixes

| Trigger | Prefix |
|---|---|
| `src == dst` | `move_graph: src and dst must differ (both = <N>)` |
| `dst` partition already has data | `move_graph: dst graph_id <N> already has data (<M> rows); clear or drop it first` |
| Negative id | `move_graph: graph_id must be >= 0` |

The dst-non-empty guard runs **before** invoking the inner
`copy_graph`, so a bad call doesn't half-execute. An empty
pre-existing dst partition (e.g. `add_graph(dst)` was called
but nothing loaded) is fine — the copy step inserts into it.

## `_pgrdf_graphs` invalidation inherits the compose

| Step | Effect on `_pgrdf_graphs` |
|---|---|
| `copy_graph(src, dst)` | Allocates the `dst` row with synthetic IRI `urn:pgrdf:graph:{dst}` if `dst` was unbound. Pre-existing IRI binding on `dst` is preserved. |
| `drop_graph(src, cascade => TRUE)` | Removes the `src` row. |

After `move_graph(src, dst)`:

- `pgrdf.graph_iri(src)` → NULL.
- `pgrdf.graph_iri(dst)` → the IRI it had before the move, or
  the synthetic `urn:pgrdf:graph:{dst}` if newly created.

## Tests

- [`tests/regression/sql/91-move-graph.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/91-move-graph.sql)
  — five invariants: happy path with row count, idempotent
  absent-src, `src == dst` rejection, dst-has-data rejection,
  negative-id rejection.
- [`tests/regression/sql/92-lifecycle-end-to-end.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/92-lifecycle-end-to-end.sql)
  — `move_graph` is a faithful compose of copy + drop.

## See also

- [Lifecycle UDFs overview](/v0.5/storage/lifecycle).
- [`copy_graph`](/v0.5/storage/copy-graph) — the row-copying half.
- [`drop_graph`](/v0.5/storage/drop-graph) — the partition-removing half.
- [`clear_graph`](/v0.5/storage/clear-graph) — pair with
  `move_graph` when the dst already has data you want gone.
