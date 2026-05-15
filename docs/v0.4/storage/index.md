# Pillar 1 — Semantic storage

RDF storage in PostgreSQL. Turtle goes in; dictionary-encoded,
hexastore-indexed, LIST-partitioned quads come out — addressable
from any Postgres client.

## Features in this pillar

- [**Load Turtle from disk**](/v0.4/storage/load-turtle) — one UDF
  reads any `.ttl` file off the server filesystem and ingests it.
- [**Inline Turtle ingest**](/v0.4/storage/parse-turtle) — same
  parser, no filesystem dependency.
- [**Verbose ingest statistics**](/v0.4/storage/verbose-stats) —
  JSONB report of timing, cache hits, batch counts.
- [**Per-graph LIST partitions**](/v0.4/storage/graph-partitions) —
  cheap whole-graph drops, isolated namespaces.
- [**Named graphs (IRI ↔ id mapping)**](/v0.4/storage/named-graphs) —
  symmetric IRI lookup for graph-scoped SPARQL.
- [**Hexastore + dictionary**](/v0.4/storage/hexastore) — three
  covering indexes (SPO/POS/OSP), interned terms.
- [**Term types**](/v0.4/storage/term-types) — typed literals,
  language tags, blank nodes, RDF collections.
- [**Bulk ingest**](/v0.4/storage/bulk-ingest) — prepared `INSERT`
  pipeline for large ontologies.
- [**Shared-memory dictionary cache**](/v0.4/storage/shmem-cache) —
  cross-backend hot path for repeated IRIs.

## At a glance

```sql
-- One-time
CREATE EXTENSION pgrdf;
SELECT pgrdf.add_graph(100);

-- Load
SELECT pgrdf.load_turtle('/fixtures/foaf.ttl', 100);
--  → 631

-- Inspect
SELECT pgrdf.count_quads(100);
SELECT * FROM pgrdf._pgrdf_dictionary
 WHERE term_type = 1 LIMIT 5;
```

[**Next — Load Turtle from disk →**](/v0.4/storage/load-turtle)
