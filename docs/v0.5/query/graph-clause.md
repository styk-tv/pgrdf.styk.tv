---
title: GRAPH clause — named-graph scoping
description: SPARQL GRAPH iri{...} and GRAPH ?g{...} for named-graph scoping in pgRDF. Composition with OPTIONAL, UNION, MINUS supported.
---

# GRAPH — named-graph scoping

> Two shapes — literal IRI and variable — both first-class.
> Both compose with OPTIONAL, UNION, MINUS.

## Two forms

| Form | Meaning |
|---|---|
| **`GRAPH <iri> { … }`** | Restrict the inner pattern to exactly the graph bound to `<iri>` in `_pgrdf_graphs`. |
| **`GRAPH ?g { … }`** | Evaluate the inner pattern against **every** non-default graph; bind `?g` to each matching graph's IRI. |

Both compile to a `WHERE _pgrdf_quads.graph_id = …` predicate on
top of the inner BGP's hexastore scan, so the SQL planner picks
the right index and join order.

## Why you'd use it

- **Project managers** — multi-graph datasets are first-class:
  separate graphs per tenant, per snapshot, per ontology version.
  Querying them is one extra clause in the SPARQL, not a separate
  endpoint.
- **Data scientists** — diff a live graph against a frozen
  snapshot in the same SPARQL call with two GRAPH clauses, or
  collect "which graphs contain this triple?" with `GRAPH ?g`.
- **Ontologists** — keep imported vocabularies in their own
  graphs; reference each explicitly when combining instance and
  schema knowledge.
- **Backend engineers** — graph identity is part of the query,
  not a connection-pool-level setting. Same SPARQL, different
  IRI, different scope.
- **Operators** — partition routing is a planner-level
  predicate; per-graph queries hit only the partition they
  target.

## Literal-IRI form

```sql
-- Bind a graph IRI once.
SELECT pgrdf.add_graph(7, 'http://example.org/g1');

-- Then query that graph by IRI.
SELECT * FROM pgrdf.sparql(
  'SELECT ?s ?p ?o
     WHERE { GRAPH <http://example.org/g1> { ?s ?p ?o } }');
```

The IRI is resolved to a `graph_id` at translate time. An
unknown IRI yields zero solutions (the partition doesn't exist).

## Variable form

`GRAPH ?g { … }` projects the matching graph's IRI as a
solution variable. Useful when you want to know **which**
graph(s) answered the question.

```sql
SELECT pgrdf.add_graph(1, 'http://example.org/g1');
SELECT pgrdf.add_graph(2, 'http://example.org/g2');
SELECT pgrdf.parse_turtle('@prefix ex: <http://e.com/>. ex:a ex:p "in g1".', 1);
SELECT pgrdf.parse_turtle('@prefix ex: <http://e.com/>. ex:a ex:p "in g2".', 2);

-- "Which graphs assert ex:a ex:p ?o, and what value did they give?"
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://e.com/>
   SELECT ?g ?o WHERE { GRAPH ?g { ex:a ex:p ?o } }');
--  → {"g": "http://example.org/g1", "o": "in g1"}
--  → {"g": "http://example.org/g2", "o": "in g2"}
```

## Composition with OPTIONAL / UNION / MINUS

GRAPH clauses compose naturally with all the
solution-combining operators. The inner BGP is scoped to the
named graph; the outer combinator works exactly as it would
against the default graph.

### OPTIONAL inside GRAPH

```sql
-- "For each named graph, every subject with foaf:name and
-- optionally a foaf:mbox."
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?g ?s ?n ?m
     WHERE { GRAPH ?g {
               ?s foaf:name ?n
               OPTIONAL { ?s foaf:mbox ?m }
             } }');
```

### UNION across two literal GRAPHs

```sql
-- Combine two named graphs' contribution into one result.
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://e.com/>
   SELECT ?s ?o
     WHERE { { GRAPH <http://example.org/g1> { ?s ex:p ?o } }
             UNION
             { GRAPH <http://example.org/g2> { ?s ex:p ?o } } }');
```

### MINUS to subtract a snapshot

```sql
-- "Subjects present in production but not in last week's snapshot."
SELECT * FROM pgrdf.sparql(
  'SELECT ?s
     WHERE { GRAPH <http://example.org/prod>     { ?s a <http://e.com/T> }
             MINUS
             { GRAPH <http://example.org/snap-w34> { ?s a <http://e.com/T> } } }');
```

## Tests

- [`tests/regression/sql/78-sparql-graph-literal-iri.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/78-sparql-graph-literal-iri.sql) — literal IRI form.
- [`tests/w3c-sparql/`](https://github.com/styk-tv/pgRDF/tree/main/tests/w3c-sparql) — conformance fixtures for `GRAPH { … }` (slice 111).
- [`tests/regression/sql/`](https://github.com/styk-tv/pgRDF/tree/main/tests/regression/sql) — GRAPH composition with OPTIONAL/UNION/MINUS (slice 112).

## See also

- [Named graphs (IRI ↔ id mapping)](/v0.5/storage/named-graphs).
- [Per-graph LIST partitions](/v0.5/storage/graph-partitions).
- [Graph lifecycle UDFs](/v0.5/storage/lifecycle).
