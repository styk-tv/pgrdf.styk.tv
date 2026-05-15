# Named graphs — IRI ↔ graph_id mapping

> Every graph has a stable IRI **and** a stable integer id. The
> `_pgrdf_graphs` table is the symmetric lookup; helper UDFs
> resolve in either direction.

## What it does

`pgrdf.add_graph(iri TEXT) → BIGINT`
`pgrdf.add_graph(id BIGINT, iri TEXT) → BIGINT`
`pgrdf.graph_id(iri TEXT) → BIGINT`
`pgrdf.graph_iri(id BIGINT) → TEXT`

The pgRDF storage layer represents graphs by integer id internally
(every quad's fourth column is `graph_id BIGINT`). The application
layer wants to talk about graphs by IRI
(`http://example.org/ontology/v3`). `_pgrdf_graphs` is the
mapping table; the UDFs above wrap insert + lookup in both
directions.

## Why you'd use it

- **Project managers** — pick a stable IRI for each graph
  (tenant, snapshot, ontology version) once. The integer id is an
  implementation detail.
- **Data scientists** — refer to graphs by IRI in SPARQL `GRAPH`
  clauses; pgRDF routes to the right partition automatically.
- **Ontologists** — keep the standard "ontology IRI ⇒ ontology
  graph" convention. Loaded vocabularies stay self-describing.

## Example

```sql
-- Allocate and bind in one call.
SELECT pgrdf.add_graph('http://example.org/g1');
--  → 1   (graph_id auto-allocated)

SELECT pgrdf.add_graph(7, 'http://example.org/snapshot');
--  → 7   (explicit id binding)

-- Symmetric lookup.
SELECT pgrdf.graph_id('http://example.org/g1');         -- → 1
SELECT pgrdf.graph_iri(7);                              -- → 'http://example.org/snapshot'

-- Now SPARQL can refer to the graph by IRI:
SELECT * FROM pgrdf.sparql(
  'SELECT ?s ?p ?o
     WHERE { GRAPH <http://example.org/g1> { ?s ?p ?o } }');
```

## How it works

`_pgrdf_graphs(id BIGINT PRIMARY KEY, iri TEXT UNIQUE NOT NULL)`
is created by the extension install script. `add_graph(BIGINT)`
allocates a partition without an IRI binding; the IRI-overload
variants additionally upsert into `_pgrdf_graphs`. `graph_id` /
`graph_iri` are `STRICT` UDFs (NULL in, NULL out) for clean SQL
composition.

See
[`SPEC.pgRDF.LLD.v0.4 §3`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
for the full named-graph contract.

## Tests

- [`tests/regression/sql/72-graphs-table-shape.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/72-graphs-table-shape.sql) — table schema.
- [`tests/regression/sql/73-add-graph-populates-iri.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/73-add-graph-populates-iri.sql) — `add_graph` upserts.
- [`tests/regression/sql/74-add-graph-iri.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/74-add-graph-iri.sql) — IRI overload.
- [`tests/regression/sql/75-add-graph-id-iri.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/75-add-graph-id-iri.sql) — id+IRI overload.
- [`tests/regression/sql/76-graph-id-lookup.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/76-graph-id-lookup.sql) — IRI → id.
- [`tests/regression/sql/77-graph-iri-lookup.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/77-graph-iri-lookup.sql) — id → IRI.

## See also

- [Per-graph LIST partitions](/v0.5/storage/graph-partitions).
- [GRAPH `<iri> { … }` in SPARQL](/v0.5/query/graph-clause).
