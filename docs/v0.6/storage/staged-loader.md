---
title: Native staged bulk loader — load_turtle_staged_run
description: pgrdf.load_turtle_staged_run drives a native, multi-backend, commit-per-phase bulk-load pipeline (STAGE → DICT → RESOLVE → INDEX), resumable on failure, proven on the full 8.2-billion-triple Wikidata graph.
---

# Native staged bulk loader

> A native, multi-backend bulk-load pipeline that **commits per
> phase** — STAGE → DICT → RESOLVE → INDEX — over a background-worker
> pool. A failed phase leaves a resume point instead of rolling back
> the whole load. Proven on the **full 8.2-billion-triple Wikidata
> `truthy` graph** in a single PostgreSQL instance.

## What it does

```
pgrdf.load_turtle_staged_run(path TEXT, graph_id BIGINT, n_workers INT DEFAULT 0) → JSONB
CALL  pgrdf.load_turtle_staged(path TEXT, graph_id BIGINT, n_workers INT DEFAULT 0)   -- procedure wrapper
```

`load_turtle_staged_run` ingests an N-Triples file at `path` (on the
**Postgres server's** filesystem) into the partition for `graph_id`,
driving a native, multi-backend importer across a dynamic
background-worker pool. `n_workers => 0` (the default) lets the loader
size the pool to the host. It returns a JSONB report of per-phase
timings and a correctness gate (`quads == triples`).

The pipeline runs four phases, **each in its own worker transaction,
each committing before the next begins**:

| Phase | What it does |
|---|---|
| **STAGE** | Parse the N-Triples file into an `UNLOGGED` staging table. The COPY fans across the worker pool — parsing and staging in parallel across backends rather than a single COPY stream. |
| **DICT** | Set-based **parallel hash-aggregate** dedup of the distinct terms. The hash-aggregate spills to disk past `work_mem`, so dictionary RAM stays **bounded** regardless of term count. |
| **RESOLVE** | Join the staged triples against the dictionary into the dictionary-encoded `_pgrdf_quads`. The join method is selectable (see `pgrdf.staged_resolve_strategy` below); the join *output* is identical for any method. |
| **INDEX** | Rebuild the hexastore indexes, **one worker per DDL** — the SPO/POS/OSP index builds run concurrently across the set. |

::: info Why a background-worker pool, not a plain UDF
A `#[pg_extern]` function cannot `COMMIT` mid-call, own N concurrent
COPY streams, or run `CREATE INDEX` jobs concurrently. The staged
loader needs all three, so it ships a dynamic background-worker pool:
the coordinator dispatches each phase to workers that run — and commit
— in their own transactions. The decisive consequence is **resumability**:
because each phase commits, a failure in any later phase leaves the
completed phases on disk (the staging table is a resume point) instead
of rolling back the entire load. A single monolithic transaction is
exactly what lost an 8.2-billion-triple load at the final index
rebuild before the staged path existed.
:::

## Prerequisite — `shared_preload_libraries`

The staged loader is built on background workers, which PostgreSQL can
only start when the extension is preloaded by the postmaster. pgRDF
must therefore be in `shared_preload_libraries`:

```ini
# postgresql.conf
shared_preload_libraries = 'pgrdf'
```

A server restart (not a reload) is required after editing this. Without
the preload, `load_turtle_staged_run` cannot spawn its workers — use a
non-staged loader (`load_turtle`, `load_turtle_streaming`) instead. See
[Bulk ingest](/v0.6/storage/bulk-ingest) for the full loader family.

## Why you'd use it

- **Project managers** — a billion-scale graph loads into one
  PostgreSQL instance you already know how to back up, monitor, and
  secure. No sidecar triple store, no second system to operate.
- **Data scientists** — load the full source graph once, then SPARQL
  and SQL over it in place. The loader self-tunes, so there is no
  multi-day tuning exercise before the data is queryable.
- **Operators** — the commit-per-phase design means a load that fails
  at 90% does not throw away the first 90%. The staging table is a
  resume point; the JSONB report names the phase that failed.
- **Ontologists** — exact dictionary dedup preserves every distinct
  literal, including every language and datatype variant of the same
  lexical value (see below). No silent collapse of multilingual data.

## Tuning levers (all GUCs — no `postgresql.conf` restart beyond preload)

Every lever below is a runtime GUC; none requires a server restart
beyond the one-time `shared_preload_libraries` preload. The defaults
are set so a full at-scale load completes **out-of-the-box on stock
PostgreSQL**.

### `pgrdf.staged_resolve_strategy` — `index` | `hash` | `auto` (default `index`)

Selects the join method the RESOLVE phase forces. RESOLVE joins the
staged rows against the dictionary; the join *output* is identical for
any method, so this is a pure performance knob — only the plan and the
temp spill differ.

| Value | Behaviour |
|---|---|
| `index` (**default**) | Forces the low-spill index nested-loop path. The at-scale-validated default: it completes the full load with no multi-TB hash spill. |
| `hash` | Forces the historical all-hash join. At billions of rows this spills multi-TB to temp and risks exhausting the temp volume. |
| `auto` | Emits no plan forcing and lets the planner choose. |

```sql
SET pgrdf.staged_resolve_strategy = 'index';   -- the default
```

### `pgrdf.staged_temp_tablespaces` — route temp spill off the data disk

The RESOLVE phase's temp spill is roughly the dictionary plus the
staged data; at the largest scale this can reach the multi-terabyte
range. By default the spill lands under `base/pgsql_tmp` on the PGDATA
disk. Setting this GUC (a tablespace name, or comma-separated list)
runs every staged phase with `temp_tablespaces` pointed at a roomier
mount, so the spill never fills the data volume:

```sql
SET pgrdf.staged_temp_tablespaces = 'fast_scratch';
```

Empty (the default) inherits the server's own `temp_tablespaces` — no
behaviour change where the operator hasn't opted in. The value is
validated to a bare-identifier list before it reaches SQL.

### Adaptive self-tune

The loader's per-phase `work_mem` / `maintenance_work_mem` and
parallelism **scale to host RAM and core count automatically**, rather
than to a fixed budget. The resolved settings are emitted to a
self-tune log so an at-scale run is observable and reproducible. The
net effect: the full load works out-of-the-box on stock PostgreSQL,
and the same loader self-tunes **down to ordinary hardware** — the
8.2 B load is a ceiling on big hardware, not a hardware requirement for
smaller graphs.

## Exact dictionary dedup — no silent literal collapse

The DICT phase keys the dictionary on the **full literal identity**
`(lexical_value, datatype, language)`, not on the lexical value alone.
Distinct RDF literals that share a value are therefore preserved as
distinct dictionary terms — `"Berlin"@en`, `"Berlin"@de`,
`"1"^^xsd:integer`, and `"1"` each resolve to their own id and are
never folded together. At Wikidata scale this preserves the full
multilingual and typed-literal space of the source graph.

## Format-aware dispatch from `load_turtle`

On a preloaded server, [`pgrdf.load_turtle`](/v0.6/storage/load-turtle)
**auto-selects the staged path** when all of the following hold:

1. pgRDF is in `shared_preload_libraries`, **and**
2. the input file sniffs as **N-Triples** (a conservative classifier
   reads the head of the file), **and**
3. no `base_iri` is supplied.

The STAGE phase parses N-Triples only (line-oriented), so a **Turtle
file always uses the full parser** — a Turtle document is never routed
to the N-Triples staged path, and there is no silent line-skipping or
data loss. When the input is Turtle on a preloaded server, a `NOTICE`
recommends N-Triples + preload to unlock the staged path. Explicit
opt-ins (`load_turtle_staged_run`, the `load_turtle_staged` procedure,
and `load_turtle(…, bulk_load => TRUE)`) are unaffected by the sniff.

## Proven at scale — the full 8.2-billion-triple Wikidata graph

The staged loader loads the **complete Wikidata `truthy` N-Triples
dump** into a single PostgreSQL instance — measured, correctness-gated:

| Measured | Result |
|---|---|
| Triples loaded | **8,199,708,346** (0 dropped) |
| Distinct dictionary terms | **1,801,847,593** |
| On-disk size | **~2.0 TB** (heap 729 GB + indexes 1448 GB) |
| Indexes | full SPO / POS / OSP hexastore |
| Exact literal dedup | `"Berlin"` preserved across **268 distinct languages** — keyed on full `(value, datatype, language)` identity, never collapsed |

| Host | Cores / RAM | Engine | Ingest | Rate |
|---|---|---|---|---|
| Azure E128ads_v7 | 128 vCPU / 1 TiB | v0.6.14 | **4 h 53 m** | **466 K triples/s** |
| Azure E64ads_v7 | 64 vCPU / 503 GiB · 3.4 TB disk | v0.6.14 | ~10.3 h | ~221 K triples/s |

The 128-core run is the flagship — **466 K triples/s**, with per-phase
timings **STAGE 14 min · DICT 1 h 51 m · RESOLVE 2 h 00 m (`index`) ·
INDEX 32 min**. It is **37 % faster than the v0.6.13 hash baseline**
(6 h 41 m / 340.7 K): the gain comes from the parallel STAGE COPY
(14 min vs. 1 h 41 m) and the concurrent index build (32 min vs.
1 h 43 m). The 64-core run proves the *same* full load completes
**out-of-the-box on half the cores and a 3.4 TB disk** — the v0.6.14
loader self-tunes to the host and uses the `index` resolve strategy and
temp-spill routing to finish with no `ENOSPC` where an all-hash resolve
would have spilled multi-TB. Treat the 8.2 B graph as a **ceiling on big
hardware**: the loader self-tunes down to ordinary hardware for smaller
graphs.

::: info Raw ingest — not reasoning
This is **raw ingest at scale** and does not include reasoning or
materialization. `truthy` statements are already-asserted direct
claims — there is nothing to infer. For the full load → reason → query
pipeline, see the LUBM benchmark in
[Pillar 3 · Inference](/v0.6/inference/).
:::

## See also

- [Bulk ingest](/v0.6/storage/bulk-ingest) — the loader family and how
  to choose between them.
- [Load Turtle from disk](/v0.6/storage/load-turtle) — the
  format-aware front door that auto-selects this path for N-Triples.
- [Hexastore + dictionary](/v0.6/storage/hexastore) — the storage
  layout the staged loader writes into.
- [Shared-memory dictionary cache](/v0.6/storage/shmem-cache).
