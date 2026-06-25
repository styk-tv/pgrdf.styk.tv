---
title: Unload — the park-graph verb (roadmap)
description: Unload parks a large source graph so it is not consuming the working set while you reason over a carved slice. Unload is on the roadmap (C4 park-graph lifecycle, v0.6.18), not shipped in v0.6.14; the manual DETACH/separate-instance approach works today.
---

# <span class="material-symbols-outlined icon-orange">layers_clear</span>Unload <span class="material-symbols-outlined icon-orange">rocket_launch</span>

> **Park** the full source graph once you have [Carved](/v0.6/process/carve)
> the slice you need — so the big graph is not holding the working set
> while [Reason](/v0.6/process/reason) runs over the slice.

::: warning Roadmap — not shipped in v0.6.14
Unload is **C4 — the park-graph lifecycle (v0.6.18)** on the
[Roadmap](/v0.6/roadmap/): a `park_graph` / `unpark_graph` pair that
offloads a graph's working set and brings it back on demand. The
one-call verbs are **not yet shipped**. The manual approaches below
work on v0.6.14 today.
:::

## What it will do

After you carve a right-sized slice, the full source graph is dead
weight for the reasoning step — it occupies buffer cache and disk you
would rather give the slice. Unload parks it: `park_graph` releases the
graph's working set (its indexes, its share of cache) without dropping
the data; `unpark_graph` restores it when you need the full graph
again.

## The manual approximation today (v0.6.14)

- **Same instance** — [`DETACH PARTITION`](/v0.6/storage/graph-partitions)
  the big graph and drop its hexastore indexes, so only the carved
  slice's indexes occupy cache. Re-attach when you need it back.
- **Separate instance** — keep the full source graph in its own
  PostgreSQL instance and simply stop it while you reason on the slice
  elsewhere.

## Where it will sit in a chain

**After [Carve](/v0.6/process/carve) (and Sealing the slice), before
[Reason](/v0.6/process/reason).** Unload is the step that frees the box
for single-threaded reasoning over the slice.

## See also

- [Roadmap](/v0.6/roadmap/) — C4, the park-graph lifecycle (v0.6.18).
- [Per-graph LIST partitions](/v0.6/storage/graph-partitions) — the `DETACH PARTITION` primitive behind the manual approach.
- [Pattern: Ingest → Carve → Reason](/v0.6/process/pattern-carve) — where Unload fits.
