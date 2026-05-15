---
title: Graph lifecycle UDFs — drop / clear / copy / move
description: Four partition-level primitives for managing named graphs in pgRDF — drop_graph, clear_graph, copy_graph, move_graph.
---

# Graph lifecycle UDFs

> Four partition-level primitives — `drop_graph`, `clear_graph`,
> `copy_graph`, `move_graph` — that manage a named graph as a
> first-class lifecycle unit, not a row-by-row table.

## What it does

The lifecycle UDFs treat each named graph as the partition-level
object it really is. They all return `BIGINT` and share the same
stable error-prefix contract.

|   | UDF | Signature | What it does |
|---|---|---|---|
| <span class="material-symbols-outlined icon-orange">delete_forever</span> | **[`drop_graph`](/v0.5/storage/drop-graph)** | `pgrdf.drop_graph(id BIGINT, cascade BOOLEAN DEFAULT TRUE) → BIGINT` | DETACH + DROP the LIST partition; remove the `_pgrdf_graphs` row. Returns pre-drop triple count. |
| <span class="material-symbols-outlined">layers_clear</span> | **[`clear_graph`](/v0.5/storage/clear-graph)** | `pgrdf.clear_graph(id BIGINT) → BIGINT` | `TRUNCATE ONLY` the partition. Partition + IRI binding survive. Returns rows-removed count. |
| <span class="material-symbols-outlined">content_copy</span> | **[`copy_graph`](/v0.5/storage/copy-graph)** | `pgrdf.copy_graph(src BIGINT, dst BIGINT) → BIGINT` | `INSERT INTO … SELECT` every row from `src` to `dst`. Auto-creates `dst` if missing. Returns count copied. |
| <span class="material-symbols-outlined">swap_horiz</span> | **[`move_graph`](/v0.5/storage/move-graph)** | `pgrdf.move_graph(src BIGINT, dst BIGINT) → BIGINT` | Composes `copy_graph(src, dst)` + `drop_graph(src, cascade => TRUE)` in the caller's transaction. Returns count moved. |

All four are **idempotent on absent inputs** (return 0, no error),
all four reject **negative ids** with a stable prefix, and all
four cooperate with the [`_pgrdf_graphs`](/v0.5/storage/named-graphs)
IRI-mapping table so the IRI surface stays consistent across
mutations.

## Why you'd use them

- **Project managers** scoping multi-tenant or multi-snapshot
  workloads: tenant rollback is `drop_graph(tenant_id)`, snapshot
  promotion is `move_graph(staging_id, prod_id)`. No row-by-row
  delete; no application-level orchestration.
- **Data scientists** building incremental pipelines: stage data
  into a scratch graph, [validate](/v0.5/validation/) it, then
  `move_graph` it into the named production graph atomically
  inside one Postgres transaction.
- **Ontologists** publishing iterative ontology versions:
  `copy_graph(old_version_id, new_version_id)` to fork a baseline,
  evolve it, [materialize](/v0.5/inference/) the new closure, swap
  via `move_graph`.
- **Backend engineers** writing graph-management code paths: a
  single SQL call per operation. Stable error prefixes
  (`drop_graph:`, `clear_graph:`, `copy_graph:`, `move_graph:`)
  make programmatic error handling reliable.
- **Operators** doing maintenance: drop or clear a stale graph
  without writing a `DELETE FROM … WHERE graph_id = N` against
  the giant `_pgrdf_quads` parent (which would lock-walk the
  whole partition hierarchy).

## Worked end-to-end example

```sql
-- 1. Stage some data into a scratch graph
SELECT pgrdf.add_graph(900, 'http://example.org/orders/2026-Q1-staging');
SELECT pgrdf.load_turtle('/data/orders-2026-Q1.ttl', 900);
--  → 48,217

-- 2. Materialize OWL 2 RL inferences on the staged graph
SELECT pgrdf.materialize(900);
--  → {"base_triples": 48217, "inferred_triples_written": 11042, ...}

-- 3. Validate against SHACL shapes
SELECT pgrdf.validate(900, 200);
--  → {"conforms": true, "results": []}

-- 4. Promote staging → production atomically
BEGIN;
  SELECT pgrdf.drop_graph(100);                  -- ditch the old production graph
  --  → 38,910
  SELECT pgrdf.move_graph(900, 100);             -- relabel staging as production
  --  → 59,259
  SELECT pgrdf.add_graph(100, 'http://example.org/orders/2026-Q1');
COMMIT;
```

The whole flow — load → infer → validate → promote — runs in
one Postgres connection. A rollback at any step unwinds
everything (lifecycle UDFs commit with the caller's transaction).

## End-to-end integration tests

The four UDFs are exercised together by
[`tests/regression/sql/92-lifecycle-end-to-end.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/92-lifecycle-end-to-end.sql),
which locks five interaction-level invariants no per-UDF file can:

- **Load → copy → drop round-trip** — the destination graph
  still answers the original BGP after the source is dropped.
- **`move_graph` is a faithful compose of copy + drop** — `src`
  answers like a freshly-dropped graph; `dst` like a
  freshly-copied graph.
- **`clear_graph` isolation under a shared dict cache** —
  clearing one graph does not touch a sibling that loaded the
  same vocabulary.
- **SPARQL `GRAPH <iri>` projection survives the lifecycle** —
  IRI rebinding + partition routing both hold through `move_graph`.
- **Drop-then-rebind loop** — re-allocate a recycled `graph_id`
  with a fresh IRI; no stale `_pgrdf_graphs` state blocks it.

## See also

- [Per-graph LIST partitions](/v0.5/storage/graph-partitions) —
  the substrate the lifecycle UDFs manage.
- [Named graphs — IRI ↔ id mapping](/v0.5/storage/named-graphs) —
  what the `_pgrdf_graphs` row each UDF maintains looks like.
- [GRAPH `<iri> { … }` in SPARQL](/v0.5/query/graph-clause) —
  how the partition surface presents to SPARQL queries.
