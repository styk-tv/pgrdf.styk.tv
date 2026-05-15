# GRAPH `<iri> { … }` — named-graph scoping

> A `GRAPH <iri> { … }` pattern restricts the inner BGP to the
> partition bound to that IRI.

## What it does

SPARQL 1.1's `GRAPH <iri> { triple-pattern … }` says **"evaluate
the inner pattern against exactly the graph identified by this
IRI."** pgRDF resolves the IRI via the
[`_pgrdf_graphs`](/v0.5/storage/named-graphs) mapping table to a
`graph_id`, then restricts the inner BGP's quad scans to that
partition.

## Why you'd use it

- **Project managers** — multi-graph datasets are first-class:
  "what does the v3-snapshot graph say about subject X" vs "what
  does the live graph say" — query each explicitly.
- **Data scientists** — query a frozen snapshot graph and a live
  graph in the same call (with two GRAPH clauses) for diffs and
  comparisons.
- **Ontologists** — keep imported vocabularies in their own graphs;
  reference each by IRI in queries that combine instance and
  schema knowledge.

## Example

```sql
-- Bind a graph IRI once.
SELECT pgrdf.add_graph(7, 'http://example.org/g1');

-- Then query that graph by IRI.
SELECT * FROM pgrdf.sparql(
  'SELECT ?s ?p ?o
     WHERE { GRAPH <http://example.org/g1> { ?s ?p ?o } }');
```

## 🚀 Forward edge — variable graph

`GRAPH ?g { … }` (a **variable** graph) — joining across all
graphs and projecting the graph IRI as a solution variable. See
[`SPEC.pgRDF.LLD.v0.4 §3.3`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## Tests

- [`tests/regression/sql/78-sparql-graph-literal-iri.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/78-sparql-graph-literal-iri.sql)

## See also

- [Named graphs (IRI ↔ id mapping)](/v0.5/storage/named-graphs).
- [Per-graph LIST partitions](/v0.5/storage/graph-partitions).
