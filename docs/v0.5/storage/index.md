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

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

A recommended path through Pillar 1 — read in this order and
each page builds on the previous one:

<div class="icon-bullets">

- <span class="material-symbols-outlined">description</span> **Start with [Load Turtle from disk](/v0.5/storage/load-turtle)** — the single UDF call that takes you from "file on disk" to "queryable quads". The simplest end-to-end win.
- <span class="material-symbols-outlined">storage</span> **Then [Per-graph LIST partitions](/v0.5/storage/graph-partitions)** — the partition-per-graph model is the structural choice everything else hangs off. Understand it before going further.
- <span class="material-symbols-outlined">account_tree</span> **Then [Named graphs (IRI ↔ id)](/v0.5/storage/named-graphs) → [Hexastore + dictionary](/v0.5/storage/hexastore)** — how graphs are addressed and how terms are stored. The two pillars of cheap storage and fast lookup.
- <span class="material-symbols-outlined">description</span> **Then [Term types](/v0.5/storage/term-types)** — datatypes, language tags, blank nodes, RDF lists. The detail you'll need before any FILTER or aggregate.
- <span class="material-symbols-outlined">bolt</span> **Then [Bulk ingest](/v0.5/storage/bulk-ingest) + [Shared-memory dictionary cache](/v0.5/storage/shmem-cache)** — performance characteristics for production loads.
- <span class="material-symbols-outlined">build</span> **Finish with [Graph lifecycle UDFs](/v0.5/storage/lifecycle)** — once you understand the storage model, the lifecycle operations are partition-level primitives.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> Refresh on RDF foundations with the [RDF 1.1 Primer](https://www.w3.org/TR/rdf11-primer/).
- <span class="material-symbols-outlined">description</span> The [RDF 1.1 Turtle](https://www.w3.org/TR/turtle/) spec — what `parse_turtle` is implementing.
- <span class="material-symbols-outlined">code</span> Postgres internals — partitioning chapter of the [PG manual](https://www.postgresql.org/docs/current/ddl-partitioning.html).
- <span class="material-symbols-outlined">mic</span> **Audio companion** — every page in this pillar has a corresponding podcast episode (see [Training](/v0.5/training#audio-companion)).

</div>
