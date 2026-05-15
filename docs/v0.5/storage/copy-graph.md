---
title: copy_graph — duplicate every quad from one graph to another
description: pgrdf.copy_graph(src, dst) INSERTs every row from the source graph into the destination graph, preserving is_inferred, auto-creating dst if absent.
---

# `copy_graph` — duplicate every quad

> `INSERT INTO … SELECT` every row from one graph into another.
> Auto-creates the destination partition if absent. Preserves
> `is_inferred`. The one lifecycle UDF that scales with row count.

## What it does

```
pgrdf.copy_graph(src BIGINT, dst BIGINT) → BIGINT
```

Single-statement `INSERT INTO pgrdf._pgrdf_quads_g<dst> SELECT * FROM pgrdf._pgrdf_quads_g<src>`.
Returns the row count copied (== the source row count at INSERT
time).

This is the only lifecycle UDF whose runtime scales linearly
with the data — `drop_graph` / `move_graph` / `clear_graph` are
all partition-DDL- or `TRUNCATE`-bounded. Plan capacity
accordingly for large graphs.

## Why you'd use it

- **Project managers** — fork a baseline graph for a parallel
  experiment, keeping the original untouched.
- **Data scientists** — clone a production graph into a scratch
  graph for read-only analytical experiments without locking the
  original.
- **Ontologists** — version a vocabulary by copying the current
  shapes/closure into a new IRI-keyed graph, then evolve the copy.
- **Backend engineers** — staging-then-promote pipelines:
  `copy_graph(prod, staging)`, mutate staging, then `move_graph`
  staging back into prod inside one transaction.
- **Operators** — physical row copy via standard `INSERT … SELECT`;
  inherits Postgres' MVCC snapshot semantics for concurrent
  writes on the source.

## Example

```sql
-- Setup: a source graph with both base and inferred rows
SELECT pgrdf.add_graph(100, 'http://example.org/prod');
SELECT pgrdf.load_turtle('/data/prod.ttl', 100);
--  → 38,910
SELECT pgrdf.materialize(100);
--  → {"base_triples": 38910, "inferred_triples_written": 9182, ...}

-- Copy to a scratch graph
SELECT pgrdf.copy_graph(100, 555);
--  → 48,092     (base + inferred, all in one go)

-- Verify
SELECT pgrdf.count_quads(555);     -- → 48,092
SELECT pgrdf.graph_iri(555);       -- → urn:pgrdf:graph:555  (auto-allocated synthetic IRI)
```

## Key contract details

### `is_inferred` carries forward

Both `is_inferred = FALSE` and `is_inferred = TRUE` rows are
copied verbatim. Materialized entailments in the source survive
into the destination as `is_inferred = TRUE` — callers don't have
to re-run `pgrdf.materialize(dst)` to recover them.

### Destination auto-create

If `_pgrdf_quads_g<dst>` does not exist, `copy_graph` calls
`pgrdf.add_graph(dst)` internally. That call also binds a
synthetic `urn:pgrdf:graph:{dst}` IRI in `_pgrdf_graphs`. A
pre-existing IRI binding on `dst` is **preserved unchanged** —
`copy_graph` never clobbers an established IRI.

### Source absence is idempotent

Copying from a `graph_id` whose partition does not exist returns
0 without erroring. **The destination partition is NOT
auto-created** on this short-circuit path — call cost stays
zero when there's nothing to copy.

### Re-call duplicates

```sql
SELECT pgrdf.copy_graph(100, 555);   -- → 48,092
SELECT pgrdf.copy_graph(100, 555);   -- → 48,092  (appended, not replaced)
SELECT pgrdf.count_quads(555);       -- → 96,184
```

`copy_graph` does **not** clear `dst` first. This is the W3C
SPARQL 1.1 Update §3.2.6 `ADD` (additive) vs `COPY`
(clear-then-copy) distinction pushed into the caller's
responsibility. For strict re-call idempotency:

```sql
SELECT pgrdf.clear_graph(555);
SELECT pgrdf.copy_graph(100, 555);
```

## Stable error prefixes

| Trigger | Prefix |
|---|---|
| `src == dst` | `copy_graph: src and dst must differ` |
| Negative id | `copy_graph: graph_id must be >= 0, got src=<S>, dst=<D>` |

The `src == dst` rejection is defensive — `INSERT … SELECT` from
a table into itself interleaves scan + insert unpredictably and
is surfaced rather than silently double-written.

## Tests

- [`tests/regression/sql/90-copy-graph.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/90-copy-graph.sql)
  — seven invariants: absent-src no-op, happy path with count,
  `is_inferred` preserved, src untouched, re-call duplicates +
  clear-then-copy round-trip, `src == dst` rejection, negative
  ids rejection.
- [`tests/regression/sql/92-lifecycle-end-to-end.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/92-lifecycle-end-to-end.sql).

## See also

- [Lifecycle UDFs overview](/v0.5/storage/lifecycle).
- [`move_graph`](/v0.5/storage/move-graph) — atomic
  `copy_graph` + `drop_graph` compose.
- [`clear_graph`](/v0.5/storage/clear-graph) — pair with
  `copy_graph` for strict re-call idempotency.
