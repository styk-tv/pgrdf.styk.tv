# <span class="material-symbols-outlined icon-blue">storage</span>Pillar 1 — Semantic storage

RDF storage in PostgreSQL. Turtle goes in; dictionary-encoded,
hexastore-indexed, LIST-partitioned quads come out — addressable
from any Postgres client.

## Features in this pillar

- [**Load Turtle from disk**](/v0.5/storage/load-turtle) — one UDF
  reads any `.ttl` file off the server filesystem and ingests it.
- [**Inline Turtle ingest**](/v0.5/storage/parse-turtle) — same
  parser, no filesystem dependency.
- [**Verbose ingest statistics**](/v0.5/storage/verbose-stats) —
  JSONB report of timing, cache hits, batch counts.
- [**Per-graph LIST partitions**](/v0.5/storage/graph-partitions) —
  cheap whole-graph drops, isolated namespaces.
- [**Named graphs (IRI ↔ id mapping)**](/v0.5/storage/named-graphs) —
  symmetric IRI lookup for graph-scoped SPARQL.
- [**Hexastore + dictionary**](/v0.5/storage/hexastore) — three
  covering indexes (SPO/POS/OSP), interned terms.
- [**Term types**](/v0.5/storage/term-types) — typed literals,
  language tags, blank nodes, RDF collections.
- [**Bulk ingest**](/v0.5/storage/bulk-ingest) — prepared `INSERT`
  pipeline for large ontologies.
- [**Shared-memory dictionary cache**](/v0.5/storage/shmem-cache) —
  cross-backend hot path for repeated IRIs.
- [**Graph lifecycle UDFs**](/v0.5/storage/lifecycle) —
  `drop_graph`, `clear_graph`, `copy_graph`, `move_graph` as
  partition-level primitives.

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

[**Next — Load Turtle from disk →**](/v0.5/storage/load-turtle)
