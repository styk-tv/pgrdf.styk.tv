---
title: Pillar 1 — Semantic storage
description: RDF storage in PostgreSQL — Turtle in; dictionary-encoded, hexastore-indexed, LIST-partitioned quads out. v0.6 adds the native staged bulk loader, proven on the full 8.2-billion-triple Wikidata graph.
---

# <span class="material-symbols-outlined icon-blue">storage</span>Pillar 1 — Semantic storage

RDF storage in PostgreSQL. Turtle goes in; dictionary-encoded,
hexastore-indexed, LIST-partitioned quads come out — addressable
from any Postgres client.

::: info v0.6 headline — the native staged bulk loader
v0.6 adds a native, multi-backend **[staged bulk loader](/v0.6/storage/staged-loader)**
— a background-worker pipeline that commits per phase
(STAGE → DICT → RESOLVE → INDEX) and is resumable on failure. It loads
the **full 8.2-billion-triple Wikidata `truthy` graph** into a single
PostgreSQL instance, dictionary-encoded with a complete SPO/POS/OSP
hexastore, and self-tunes down to ordinary hardware so the same load
works out-of-the-box on stock PostgreSQL.
:::

## Features in this pillar

<div class="icon-bullets">

- <span class="material-symbols-outlined">description</span> [**Load Turtle from disk**](/v0.6/storage/load-turtle) — one UDF reads any `.ttl` / `.nt` file off the server filesystem and ingests it; on preloaded servers it auto-selects the staged path for N-Triples.
- <span class="material-symbols-outlined">bolt</span> [**Native staged bulk loader**](/v0.6/storage/staged-loader) — `load_turtle_staged_run`: a commit-per-phase, resumable, background-worker pipeline that loads the full 8.2 B graph.
- <span class="material-symbols-outlined">description</span> [**Inline Turtle / TriG / N-Quads ingest**](/v0.6/storage/parse-turtle) — same parser family, no filesystem dependency; `parse_trig` / `parse_nquads` for quad-bearing serialisations.
- <span class="material-symbols-outlined">query_stats</span> [**Verbose ingest statistics**](/v0.6/storage/verbose-stats) — JSONB report of timing, cache hits, batch counts.
- <span class="material-symbols-outlined">storage</span> [**Per-graph LIST partitions**](/v0.6/storage/graph-partitions) — cheap whole-graph drops, isolated namespaces.
- <span class="material-symbols-outlined">account_tree</span> [**Named graphs (IRI ↔ id mapping)**](/v0.6/storage/named-graphs) — symmetric IRI lookup for graph-scoped SPARQL.
- <span class="material-symbols-outlined">account_tree</span> [**Hexastore + dictionary**](/v0.6/storage/hexastore) — three covering indexes (SPO/POS/OSP), interned terms, proven at billion scale.
- <span class="material-symbols-outlined">description</span> [**Term types**](/v0.6/storage/term-types) — typed literals, language tags, blank nodes, RDF collections.
- <span class="material-symbols-outlined">bolt</span> [**Bulk ingest**](/v0.6/storage/bulk-ingest) — the loader family: prepared `INSERT`, parallel `bulk_load`, streaming windows, staged pipeline.
- <span class="material-symbols-outlined">bolt</span> [**Shared-memory dictionary cache**](/v0.6/storage/shmem-cache) — cross-backend hot path for repeated IRIs.
- <span class="material-symbols-outlined">build</span> [**Graph lifecycle UDFs**](/v0.6/storage/lifecycle) — `drop_graph`, `clear_graph`, `copy_graph`, `move_graph` as partition-level primitives.

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

[**Next — Load Turtle from disk →**](/v0.6/storage/load-turtle)

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

A recommended path through Pillar 1 — read in this order and
each page builds on the previous one:

<div class="icon-bullets">

- <span class="material-symbols-outlined">description</span> **Start with [Load Turtle from disk](/v0.6/storage/load-turtle)** — the single UDF call that takes you from "file on disk" to "queryable quads". The simplest end-to-end win.
- <span class="material-symbols-outlined">storage</span> **Then [Per-graph LIST partitions](/v0.6/storage/graph-partitions)** — the partition-per-graph model is the structural choice everything else hangs off. Understand it before going further.
- <span class="material-symbols-outlined">account_tree</span> **Then [Named graphs (IRI ↔ id)](/v0.6/storage/named-graphs) → [Hexastore + dictionary](/v0.6/storage/hexastore)** — how graphs are addressed and how terms are stored. The two pillars of cheap storage and fast lookup.
- <span class="material-symbols-outlined">description</span> **Then [Term types](/v0.6/storage/term-types)** — datatypes, language tags, blank nodes, RDF lists. The detail you'll need before any FILTER or aggregate.
- <span class="material-symbols-outlined">bolt</span> **Then [Bulk ingest](/v0.6/storage/bulk-ingest) → [Native staged bulk loader](/v0.6/storage/staged-loader) + [Shared-memory dictionary cache](/v0.6/storage/shmem-cache)** — performance characteristics from ontology-scale loads up to the full 8.2 B graph.
- <span class="material-symbols-outlined">build</span> **Finish with [Graph lifecycle UDFs](/v0.6/storage/lifecycle)** — once you understand the storage model, the lifecycle operations are partition-level primitives.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> Refresh on RDF foundations with the [RDF 1.1 Primer](https://www.w3.org/TR/rdf11-primer/).
- <span class="material-symbols-outlined">description</span> The [RDF 1.1 Turtle](https://www.w3.org/TR/turtle/) spec — what `parse_turtle` is implementing.
- <span class="material-symbols-outlined">code</span> Postgres internals — partitioning chapter of the [PG manual](https://www.postgresql.org/docs/current/ddl-partitioning.html).

</div>
