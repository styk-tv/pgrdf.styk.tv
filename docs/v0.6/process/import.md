---
title: Import — the ingest verb
description: Import is the parallel ingest verb — get RDF into a graph. Backed by load_turtle, the native staged bulk loader, the streaming loader, and the inline parse_* family. Scales across a background-worker pool to the full 8.2-billion-triple Wikidata graph.
---

# <span class="material-symbols-outlined icon-blue">storage</span>Import

> Get RDF into a graph. **Import** is the first verb in every chain and
> the one that scales hardest — it fans across a background-worker pool
> and is proven on the full [8.2-billion-triple graph](/v0.6/scale/).

## What it is

Import reads RDF off the server filesystem (or an inline string),
dictionary-encodes every term, and writes the dictionary-encoded quads
into the [LIST partition](/v0.6/storage/graph-partitions) for a
`graph_id`. The output is a queryable graph; the input is Turtle,
N-Triples, TriG, or N-Quads.

## How you run it

Five entry points cover the range from a one-shot file load to a
billion-triple bulk ingest.

### load_turtle — the front door

```sql
pgrdf.load_turtle(path TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL, bulk_load BOOLEAN DEFAULT FALSE) → BIGINT
```

Reads a `.ttl` / `.nt` file off the server filesystem and returns the
triple count. On a preloaded server it auto-selects the staged path for
N-Triples. See [Load Turtle from disk](/v0.6/storage/load-turtle).

### load_turtle_staged_run — billion-scale bulk

```sql
pgrdf.load_turtle_staged_run(path TEXT, graph_id BIGINT, n_workers INT DEFAULT 0) → JSONB
```

The native, multi-backend, commit-per-phase loader
(STAGE → DICT → RESOLVE → INDEX). `n_workers => 0` self-tunes to the
host and returns a per-phase timing report. See
[Native staged bulk loader](/v0.6/storage/staged-loader).

### load_turtle_streaming — bounded windows

```sql
pgrdf.load_turtle_streaming(path TEXT, graph_id BIGINT) → JSONB
```

Reads the file in bounded windows for inputs larger than RAM on an
unpreloaded server. See [Bulk ingest](/v0.6/storage/bulk-ingest).

### parse_turtle / parse_trig / parse_nquads — inline strings

```sql
pgrdf.parse_turtle(rdf TEXT, graph_id BIGINT) → BIGINT
```

Ingest an inline RDF string rather than a file — handy for tests and
small fixtures. `parse_trig` and `parse_nquads` take the same shape for
TriG and N-Quads. See [Inline Turtle ingest](/v0.6/storage/parse-turtle).

### add_graph — register the partition

```sql
pgrdf.add_graph(graph_id BIGINT)
```

Allocate the LIST partition Import writes into. See
[Named graphs](/v0.6/storage/named-graphs).

## Where it sits in a chain

**First.** Every chain begins with Import. It is followed by
[Seal](/v0.6/process/seal), then any of [Query](/v0.6/process/query),
[Reason](/v0.6/process/reason), or [Validate](/v0.6/process/validate).

::: tip Scaling class — parallel
Import scales with the box. The staged loader fans STAGE COPY and the
INDEX build across a background-worker pool; add cores and the load goes
faster, all the way to the [8.2 B ceiling](/v0.6/scale/). This is the
half of the operating model that scales horizontally.
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
