# Per-graph LIST partitions

> Each `graph_id` is its own Postgres LIST partition of
> `_pgrdf_quads`. Adding one is one UDF call; dropping a whole
> graph is a partition detach, not a row scan.

## What it does

`pgrdf.add_graph(graph_id BIGINT) → BOOLEAN`
`pgrdf.count_quads(graph_id BIGINT DEFAULT 0) → BIGINT`

`pgrdf._pgrdf_quads` is LIST-partitioned on `graph_id`. Each call
to `pgrdf.add_graph(N)` creates (or returns the existing) child
partition for that id. `pgrdf.count_quads(N)` returns the row
count of that partition.

## Why you'd use it

- **Project managers** — multi-tenant and multi-ontology workloads
  get cheap isolated namespaces. Rolling back a load run is a
  partition detach, not a `DELETE`.
- **Data scientists** — version your knowledge graph by
  partition; query the live graph and a frozen snapshot in the
  same SQL session.
- **Ontologists** — keep each loaded vocabulary in its own
  partition for clean composition + lifecycle.

## Example

```sql
-- Allocate three partitions.
SELECT pgrdf.add_graph(1);   -- → true (new)
SELECT pgrdf.add_graph(2);   -- → true
SELECT pgrdf.add_graph(1);   -- → false (already exists)

-- Load some data into each.
SELECT pgrdf.parse_turtle('@prefix ex:<http://e.com/>. ex:a ex:p ex:b .', 1);
SELECT pgrdf.parse_turtle('@prefix ex:<http://e.com/>. ex:c ex:p ex:d .', 2);

-- Per-partition counts are cheap.
SELECT pgrdf.count_quads(1);   -- → 1
SELECT pgrdf.count_quads(2);   -- → 1
```

For an explicit IRI ↔ id binding, see
[**Named graphs**](/v0.5/storage/named-graphs).

## How it works

`_pgrdf_quads` is declared `PARTITION BY LIST (graph_id)`; each
`add_graph(N)` call issues `CREATE TABLE … PARTITION OF
_pgrdf_quads FOR VALUES IN (N)`. The covering indexes (SPO/POS/OSP)
are declared on the parent table and inherited.

✅ **Graph lifecycle UDFs shipped** — `drop_graph`,
`clear_graph`, `copy_graph`, `move_graph` are now first-class
partition-level primitives. See
[**Graph lifecycle UDFs**](/v0.5/storage/lifecycle) for the
overview, or the individual pages:
[`drop_graph`](/v0.5/storage/drop-graph),
[`clear_graph`](/v0.5/storage/clear-graph),
[`copy_graph`](/v0.5/storage/copy-graph),
[`move_graph`](/v0.5/storage/move-graph).

## Tests

- [`tests/regression/sql/11-quads-basic.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/11-quads-basic.sql)
- [`tests/regression/sql/12-graphs.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/12-graphs.sql)

## See also

- [Named graphs (IRI ↔ id)](/v0.5/storage/named-graphs).
- [Graph lifecycle UDFs](/v0.5/storage/lifecycle).
- [GRAPH `<iri> { … }` in SPARQL](/v0.5/query/graph-clause).
