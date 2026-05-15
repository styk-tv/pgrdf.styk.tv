---
layout: home

hero:
  name: pgRDF
  text: Semantic web inside PostgreSQL.
  tagline: Load Turtle. Query SPARQL. Validate SHACL. Materialize OWL 2 RL — all in one Postgres extension.
  actions:
    - theme: brand
      text: Get started
      link: /v0.4/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/styk-tv/pgRDF
    - theme: alt
      text: crates.io
      link: https://crates.io/crates/pgrdf

features:
  - title: Semantic storage
    details: Turtle in. Quads out. Dictionary-encoded, hexastore-indexed, LIST-partitioned per graph.
    link: /v0.4/storage/
    linkText: Storage features →
  - title: Semantic query
    details: SPARQL 1.1 SELECT/ASK with N-pattern BGP joins, FILTER, OPTIONAL, UNION, MINUS, aggregates, BIND, GRAPH.
    link: /v0.4/query/
    linkText: SPARQL features →
  - title: Materialization
    details: OWL 2 RL forward-chaining. Subclass closures, equivalence, inverse, transitive — written back as queryable rows.
    link: /v0.4/inference/
    linkText: Inference features →
  - title: Validation
    details: SHACL Core. A data graph + a shapes graph yields a W3C-shape ValidationReport JSONB you can persist or alert on.
    link: /v0.4/validation/
    linkText: Validation features →
---

## Why pgRDF

You already trust Postgres for storage, indexes, partitions,
transactions, and ops. pgRDF treats Postgres as the **storage and
execution engine** for your knowledge graph too: every RDF term
lives in a dictionary table, every quad lives in a partitioned
hexastore, every SPARQL query compiles to native SQL, and every
inference run writes results back as ordinary rows.

No separate triplestore. No second deployment surface. One Postgres.

```sql
-- One-time install
CREATE EXTENSION pgrdf;

-- Load an ontology
SELECT pgrdf.load_turtle('/fixtures/foaf.ttl', 100);
--  → 631

-- Query with SPARQL
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n WHERE { ?s foaf:name ?n }');

-- Materialize OWL 2 RL inferences
SELECT pgrdf.materialize(100);

-- Validate against SHACL shapes
SELECT pgrdf.validate(100, 200);
```

[**Start with the introduction →**](/v0.4/introduction)
