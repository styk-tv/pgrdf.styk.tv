---
title: Scale & benchmarks
description: The pgRDF v0.6.14 native staged bulk loader at 8.2 billion triples — 8,199,708,346 triples (0 dropped), 1.8 billion distinct terms, ~2.0 TB on disk, loaded into a single PostgreSQL instance in 4 h 53 m at 466 K triples per second, and self-tuning down to ordinary hardware.
---

# <span class="material-symbols-outlined icon-blue">query_stats</span>Scale & benchmarks

> The native [staged bulk loader](/v0.6/storage/staged-loader) takes
> the **complete 8.2-billion-triple Wikidata `truthy` graph** into a
> **single PostgreSQL instance** — dictionary-encoded, full SPO/POS/OSP
> hexastore, correctness-gated, **0 triples dropped**. This is a
> ceiling on big hardware; the same loader self-tunes down to ordinary
> hardware out-of-the-box.

## The 8.2-billion-triple load

The staged loader ingests the complete Wikidata `truthy` N-Triples
dump. Every figure below is measured, not modelled, and the load is
correctness-gated (`quads == triples`):

| Measured | Result |
|---|---|
| Triples loaded | **8,199,708,346** (0 dropped) |
| Distinct dictionary terms | **1,801,847,593** |
| On-disk size | **~2.0 TB** — heap **729 GB** + indexes **1448 GB** |
| Indexes | full SPO / POS / OSP hexastore |
| Exact literal dedup | `"Berlin"` preserved across **268 distinct languages** — keyed on full `(value, datatype, language)` identity, never collapsed |

The exact-dedup row is the correctness keystone at scale:
`"Berlin"@en`, `"Berlin"@de`, `"Berlin"@fr` and 265 more are
**distinct** dictionary terms. Deduplication is on the full
`(value, datatype, language)` key, so the dictionary never silently
collapses a language-tagged literal into a bare string.

## Hosts and rates

| Host | Cores / RAM | Engine | Ingest | Rate |
|---|---|---|---|---|
| Azure E128ads_v7 | 128 vCPU / 1 TiB | v0.6.14 | **4 h 53 m** | **466 K triples/s** |
| Azure E64ads_v7 | 64 vCPU / 503 GiB · 3.4 TB disk | v0.6.14 | ~10.3 h | ~221 K triples/s |

The 128-core run is the flagship. The 64-core run proves the *same*
full 8.2-billion-triple load completes **out-of-the-box on half the
cores and a 3.4 TB disk** — the loader self-tunes to the host, using
the `index` resolve strategy and temp-spill routing to finish without
running out of disk where an all-hash resolve would have spilled
multi-TB.

## Phase breakdown — E128, v0.6.14

The pipeline commits per phase (STAGE → DICT → RESOLVE → INDEX), so
each phase is independently timed:

| Phase | Time | What it does |
|---|---|---|
| **STAGE** | 14 min | Parse the N-Triples dump into an `UNLOGGED` staging table; the COPY fans across the worker pool. |
| **DICT** | 1 h 51 m | Parallel hash-aggregate dedup of the 1.8 B distinct terms; spills to disk so dictionary RAM stays bounded. |
| **RESOLVE** | 2 h 00 m | Join staged triples against the dictionary into encoded quads (`index` strategy). |
| **INDEX** | 32 min | Rebuild the SPO/POS/OSP hexastore, one worker per DDL — the index builds run concurrently. |

## 37 % faster than the v0.6.13 baseline

The v0.6.14 flagship run is **37 % faster** than the v0.6.13 hash
baseline of **6 h 41 m / 340.7 K triples/s**:

| | v0.6.13 (hash baseline) | v0.6.14 | Delta |
|---|---|---|---|
| Total ingest | 6 h 41 m / 340.7 K tps | **4 h 53 m / 466 K tps** | **−37 %** |
| STAGE COPY | 1 h 41 m | **14 min** | parallel COPY |
| INDEX rebuild | 1 h 43 m | **32 min** | concurrent index build |

The gain comes from the **parallel STAGE COPY** (fanning the COPY
across the worker pool instead of a single stream) and the
**concurrent index build** (one worker per DDL rather than serial
`CREATE INDEX`).

## A ceiling, not a requirement

Treat the 8.2 B graph as a **ceiling on big hardware** — proof of what
a single PostgreSQL box can hold, not a hardware requirement. The
loader self-tunes down to ordinary hardware: pass `n_workers => 0`
(the default) and it sizes the worker pool, the resolve strategy, and
the temp-spill routing to the host it finds. The same `load_turtle` /
`load_turtle_staged_run` call that fills a 128-core box also ingests a
laptop-sized graph on stock PostgreSQL.

::: info Raw ingest — not reasoning
The 8.2 B figure is **raw ingest at scale**, not reasoning. `truthy`
statements are already-asserted direct claims, so there is nothing to
infer. Reasoning is single-threaded and runs over a right-sized graph
— see [Processes & flows](/v0.6/process/) for the operating model and
[Pillar 3 · Inference](/v0.6/inference/) for the full
load → reason → query LUBM pipeline.
:::

## See also

<div class="icon-bullets">

- <span class="material-symbols-outlined">bolt</span> [**Native staged bulk loader**](/v0.6/storage/staged-loader) — the STAGE → DICT → RESOLVE → INDEX pipeline behind these numbers.
- <span class="material-symbols-outlined">account_tree</span> [**Processes & flows**](/v0.6/process/) — the operating model: parallel ingest, single-threaded reasoning over a carved slice.
- <span class="material-symbols-outlined">rocket_launch</span> [**Roadmap**](/v0.6/roadmap/) — graph carving and per-graph index reorganization toward v0.7.0.

</div>
