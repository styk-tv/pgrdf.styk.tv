---
title: Bulk ingest — the loader family
description: pgRDF's ingest paths, from the prepared batched INSERT through the parallel bulk loader and streaming windows to the native staged pipeline that loads the full 8.2-billion-triple graph.
---

# Bulk ingest

> pgRDF ships a family of ingest paths, each tuned for a different
> scale — from ontology-sized loads where parse cost dominates, up to
> the full source graph that does not fit in RAM.

## The loader family

Pick the path that matches the size of the load:

| Path | When to use | What it does |
|---|---|---|
| **`parse_turtle` / `load_turtle`** (default) | Ontologies, fixtures, anything up to ~100 k triples | Prepared batched `INSERT` + the shared-memory dictionary cache. Parse cost dominates, not insert cost. |
| **`load_turtle(…, bulk_load => TRUE)`** | A fresh load of a single large N-Triples file that fits in RAM | Parallel parse + in-memory dictionary + deferred indexes — a 2.3–3.5× fast path on a fresh load. |
| **`load_turtle_streaming`** | A graph larger than RAM | Reads the file in bounded windows; peak memory is one window plus the dictionary, regardless of file size. |
| **`load_turtle_staged_run`** | The largest loads — billions of triples | A native, multi-backend, commit-per-phase pipeline (STAGE → DICT → RESOLVE → INDEX), resumable on failure. Loads the full 8.2 B graph. |

### Default path — prepared batched `INSERT`

Both `pgrdf.load_turtle` and `pgrdf.parse_turtle` buffer parsed quads
into batches and flush each batch through a **prepared statement**
bound once per call. Combined with the
[shared-memory dictionary cache](/v0.6/storage/shmem-cache), this
removes the per-triple SQL roundtrip cost that dominates naïve
row-by-row ingest. This is the shipped ingest contract exercised by
the full test bar.

### Parallel bulk loader — `bulk_load => TRUE`

A fresh-load fast path that takes ingest off the single backend core.
On an empty dictionary it parses the line-oriented N-Triples across all
cores, de-duplicates and assigns dictionary ids in memory, and bulk-inserts —
eliminating the per-term anti-join that dominated serial ingest. Above
`pgrdf.bulk_defer_index_min` (default `100000`) it also drops the
hexastore + dictionary indexes before the load and rebuilds them in
parallel afterward. On a populated dictionary the call transparently
falls back to the standard path, so it is always correct. Measured at
2.3–3.5× over serial ingest at LUBM-250 / LUBM-500.

### Streaming / windowed loader — `load_turtle_streaming`

```
pgrdf.load_turtle_streaming(path TEXT, graph_id BIGINT,
  window_triples INT DEFAULT 20000000,
  id_reserve_block INT DEFAULT 1000000,
  base_iri TEXT DEFAULT NULL) → BIGINT
```

Reads the file one `window_triples`-sized window at a time — parse,
intern, flush — and **never holds the whole file in RAM**. Peak memory
is one window plus the dictionary, regardless of total file size. The
dictionary is a persistent in-Rust map carried across windows, so term
resolution is a hashmap lookup, never a per-term SQL anti-join.
Indexes are dropped once before the first window and rebuilt once after
the last. Malformed lines are skipped and counted (`parse_skipped`)
rather than aborting the load.

### Native staged loader — `load_turtle_staged_run`

For the largest loads, the
**[native staged bulk loader](/v0.6/storage/staged-loader)** drives a
multi-backend, **commit-per-phase** pipeline over a background-worker
pool — parse → `UNLOGGED` staging → parallel hash-aggregate dedup →
parallel resolve → concurrent index. Because each phase commits, a
failure leaves a resume point instead of rolling back the whole load.
It loads the **full 8.2-billion-triple Wikidata `truthy` graph**
(8,199,708,346 triples, 1,801,847,593 distinct terms) into one
PostgreSQL instance, and self-tunes down to ordinary hardware.
Requires `shared_preload_libraries = pgrdf`.

## Why you'd use it

- **Project managers** — capacity planning is straightforward: small
  loads are parse-bound; large loads have a self-tuning path that works
  out-of-the-box. There is one ingest surface, not a separate ETL
  system.
- **Data scientists** — ad-hoc loads from notebooks finish in seconds
  for ontology-scale data; a billion-row dump loads through the same
  family of UDFs.
- **Ontologists** — refresh a vocabulary in a CI pipeline without
  multi-minute ingest stalls.

## Example — see the batching

```sql
-- Load a Turtle file; the verbose variant reveals the batching.
SELECT pgrdf.load_turtle_verbose('/fixtures/large.ttl', 9);
```

```json
{
  "triples":         48217,
  "dict_cache_hits": 192845,
  "dict_db_calls":   3104,
  "quad_batches":    19,
  "elapsed_ms":      812.4
}
```

## Tests

- [`tests/regression/sql/25-bulk-ingest.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/25-bulk-ingest.sql)
  — correctness of batched inserts.
- [`tests/regression/sql/52-bulk-ingest-perf.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/52-bulk-ingest-perf.sql)
  — verifies the prepared-statement plan reuse and batch accounting in
  the verbose report.

## See also

- [Native staged bulk loader](/v0.6/storage/staged-loader) — the
  billion-scale path.
- [Verbose ingest statistics](/v0.6/storage/verbose-stats).
- [Shared-memory dictionary cache](/v0.6/storage/shmem-cache).
