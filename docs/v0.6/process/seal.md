---
title: Seal — the index-build verb
description: Seal builds the hexastore indexes so an imported graph is query-ready. In the native staged loader it is the concurrent INDEX phase (one worker per DDL); it scales with the box. Seal is a step in the loaders, not a standalone UDF.
---

# <span class="material-symbols-outlined icon-blue">build</span>Seal

> Make an imported graph query-ready by building its
> [hexastore indexes](/v0.6/storage/hexastore). **Seal** is the
> second parallel verb — it finalizes the SPO / POS / OSP index
> permutations the query planner relies on.

## What it is

Raw imported quads are queryable, but fast lookup in any direction —
subject, predicate, or object first — needs the covering index
permutations. Seal is the step that builds them. After Seal, a
multi-pattern SPARQL join resolves against an index rather than a
sequential scan.

::: info Seal is a step, not a UDF
There is no `pgrdf.seal()`. Seal names the **index-build step** that
the loaders perform. In the [native staged loader](/v0.6/storage/staged-loader)
it is the **INDEX phase** — the SPO / POS / OSP builds run
concurrently, one background worker per `CREATE INDEX`. When you build
a graph by other means, Seal is the equivalent `CREATE INDEX` step.
:::

## Where it sits in a chain

**After [Import](/v0.6/process/import), before everything else.** A
graph must be sealed before [Query](/v0.6/process/query),
[Reason](/v0.6/process/reason), or [Validate](/v0.6/process/validate)
run efficiently. In the [scale-meets-hardware chain](/v0.6/process/pattern-carve)
you seal twice: once on the full imported graph, then again on the
carved slice.

::: tip Scaling class — parallel
Seal scales with the box. The staged loader's INDEX phase builds the
hexastore permutations concurrently — on the 8.2 B flagship the index
build ran in **31.9 min** across the worker pool. See
[Scale & benchmarks](/v0.6/scale/).
:::

## See also

- [Hexastore + dictionary](/v0.6/storage/hexastore) — the SPO / POS / OSP index layout Seal builds.
- [Native staged bulk loader](/v0.6/storage/staged-loader) — where Seal is the INDEX phase.
- [Query](/v0.6/process/query) — what a sealed graph unlocks.
