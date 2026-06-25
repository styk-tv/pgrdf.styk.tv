---
title: Import — the ingest verb
description: Import is the parallel ingest verb — get RDF into a graph. Backed by load_turtle, the native staged bulk loader, the streaming loader, and the inline parse_* family. Scales across a background-worker pool to the full 8.2-billion-triple Wikidata graph.
---

# <span class="material-symbols-outlined icon-blue">storage</span>Import

> Get RDF into a graph. **Import** is the first verb in every chain
> and the one that scales hardest — it fans across a background-worker
> pool and is proven on the full [8.2-billion-triple graph](/v0.6/scale/).

## What it is

Import reads RDF off the server filesystem (or an inline string),
dictionary-encodes every term, and writes the dictionary-encoded quads
into the [LIST partition](/v0.6/storage/graph-partitions) for a
`graph_id`. The output is a queryable graph; the input is Turtle,
N-Triples, TriG, or N-Quads.

## How you run it

| UDF | Use it for |
|---|---|
| [`pgrdf.load_turtle(path, graph_id, base_iri DEFAULT NULL, bulk_load DEFAULT FALSE) → BIGINT`](/v0.6/storage/load-turtle) | The front door. Reads a `.ttl` / `.nt` file off the server. On a preloaded server it auto-selects the staged path for N-Triples. |
| [`pgrdf.load_turtle_staged_run(path, graph_id, n_workers DEFAULT 0) → JSONB`](/v0.6/storage/staged-loader) | The native, multi-backend, commit-per-phase bulk loader (STAGE → DICT → RESOLVE → INDEX). `n_workers => 0` self-tunes to the host. |
| [`pgrdf.load_turtle_streaming(...)`](/v0.6/storage/bulk-ingest) | Bounded-window streaming for files larger than RAM on an unpreloaded server. |
| [`pgrdf.parse_turtle` / `parse_trig` / `parse_nquads`](/v0.6/storage/parse-turtle) | Ingest an inline RDF string rather than a file. |
| [`pgrdf.add_graph(graph_id)`](/v0.6/storage/named-graphs) | Register the partition Import writes into. |

## Where it sits in a chain

**First.** Every chain begins with Import. It is followed by
[Seal](/v0.6/process/seal) (build the indexes), then any of
[Query](/v0.6/process/query), [Reason](/v0.6/process/reason), or
[Validate](/v0.6/process/validate).

::: tip Scaling class — parallel
Import scales with the box. The staged loader fans STAGE COPY and the
INDEX build across a background-worker pool; add cores and the load
goes faster, all the way to the [8.2 B ceiling](/v0.6/scale/). This is
the half of the operating model that scales horizontally.
:::

## Example

```sql
-- register the graph, then load a file off the server filesystem
SELECT pgrdf.add_graph(100);
SELECT pgrdf.load_turtle('/fixtures/ontologies/foaf.ttl', 100);
--  → 631   (triples loaded)

-- billion-scale: the native staged loader, self-tuned to the host
SELECT pgrdf.load_turtle_staged_run('/data/wikidata-truthy.nt', 1, 0);
--  → {"ok": true, "quads": 8199708346, "phase_ms": { ... }}
```

## See also

- [Pillar 1 — Semantic storage](/v0.6/storage/) — the storage layer Import writes into.
- [Native staged bulk loader](/v0.6/storage/staged-loader) — the engine behind billion-scale Import.
- [Seal](/v0.6/process/seal) — the next verb: making the imported graph query-ready.
