# <span class="material-symbols-outlined icon-blue">storage</span>Pillar 1 — Semantic storage

RDF storage in PostgreSQL. Turtle goes in; dictionary-encoded,
hexastore-indexed, LIST-partitioned quads come out — addressable
from any Postgres client.

## Features in this pillar

<div class="icon-bullets">

- <span class="material-symbols-outlined">description</span> [**Load Turtle from disk**](/v0.5/storage/load-turtle) — one UDF reads any `.ttl` file off the server filesystem and ingests it.
- <span class="material-symbols-outlined">description</span> [**Inline Turtle ingest**](/v0.5/storage/parse-turtle) — same parser, no filesystem dependency.
- <span class="material-symbols-outlined">query_stats</span> [**Verbose ingest statistics**](/v0.5/storage/verbose-stats) — JSONB report of timing, cache hits, batch counts.
- <span class="material-symbols-outlined">storage</span> [**Per-graph LIST partitions**](/v0.5/storage/graph-partitions) — cheap whole-graph drops, isolated namespaces.
- <span class="material-symbols-outlined">account_tree</span> [**Named graphs (IRI ↔ id mapping)**](/v0.5/storage/named-graphs) — symmetric IRI lookup for graph-scoped SPARQL.
- <span class="material-symbols-outlined">account_tree</span> [**Hexastore + dictionary**](/v0.5/storage/hexastore) — three covering indexes (SPO/POS/OSP), interned terms.
- <span class="material-symbols-outlined">description</span> [**Term types**](/v0.5/storage/term-types) — typed literals, language tags, blank nodes, RDF collections.
- <span class="material-symbols-outlined">bolt</span> [**Bulk ingest**](/v0.5/storage/bulk-ingest) — prepared `INSERT` pipeline for large ontologies.
- <span class="material-symbols-outlined">bolt</span> [**Shared-memory dictionary cache**](/v0.5/storage/shmem-cache) — cross-backend hot path for repeated IRIs.
- <span class="material-symbols-outlined">build</span> [**Graph lifecycle UDFs**](/v0.5/storage/lifecycle) — `drop_graph`, `clear_graph`, `copy_graph`, `move_graph` as partition-level primitives.

</div>

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
