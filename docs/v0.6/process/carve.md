---
title: Carve — the slicing verb (roadmap)
description: Carve cuts a query-defined slice out of a large source graph into a fresh, small graph with its own compact dictionary — so single-threaded reasoning runs over a right-sized graph. Carve is on the roadmap (C1/C2, v0.6.15–v0.6.16), not shipped in v0.6.14.
---

# <span class="material-symbols-outlined icon-orange">content_copy</span>Carve <span class="material-symbols-outlined icon-orange">rocket_launch</span>

> Cut a **query-defined slice** out of a large source graph into a
> fresh, small graph — so [Reason](/v0.6/process/reason) and
> [Validate](/v0.6/process/validate) run over a graph **sized to your
> hardware** instead of the whole source.

::: warning Roadmap — not shipped in v0.6.14
Carve is the headline of the carving line on the
[Roadmap](/v0.6/roadmap/): **C1 — carve by query (v0.6.15)** and
**C2 — re-encode into a fresh small dictionary (v0.6.16)**. The
one-call `carve_graph` verb is the target; it is **not yet a shipped
UDF**. The manual approximation below works on v0.6.14 today.
:::

## What it will do

Carve resolves a SPARQL query into the set of quads it touches, copies
just those quads into a new `graph_id`, and **re-encodes them against a
fresh, small dictionary** (C2) so the working set shrinks from the full
source dictionary to just the slice. The carved graph is then
[Sealed](/v0.6/process/seal) with its own [hexastore](/v0.6/storage/hexastore)
and is small enough to reason over on ordinary hardware.

## The manual approximation today (v0.6.14)

Until the one-call verb ships, you can approximate Carve with shipped
primitives: select the slice with [`pgrdf.construct`](/v0.6/query/construct),
write it out, and reload it into a fresh graph with the
[staged loader](/v0.6/storage/staged-loader):

```sql
-- 1. CONSTRUCT the slice you need to reason over
SELECT pgrdf.construct(
  'PREFIX ex: <http://example.com/>
   CONSTRUCT { ?s ?p ?o }
   WHERE { ex:SoftwareEngineering (ex:related|^ex:related){1,2} ?s . ?s ?p ?o }');

-- 2. reload that slice into a fresh graph (its own small dictionary)
SELECT pgrdf.add_graph(900);
SELECT pgrdf.load_turtle_staged_run('/tmp/slice.nt', 900, 0);
```

The shipped verb will fold those steps into one call and re-encode in
place — see [C1/C2 on the roadmap](/v0.6/roadmap/).

## Where it will sit in a chain

**After [Import](/v0.6/process/import) + [Seal](/v0.6/process/seal) of
the full graph; before [Unload](/v0.6/process/unload) and
[Reason](/v0.6/process/reason).** Carve is the pivot of the
[scale-meets-hardware pattern](/v0.6/process/pattern-carve).

## See also

- [Roadmap](/v0.6/roadmap/) — C1/C2/C3, the carving line toward v0.7.0.
- [Pattern: Ingest → Carve → Reason](/v0.6/process/pattern-carve) — the full chain.
- [Hexastore + dictionary](/v0.6/storage/hexastore) — the per-graph index reorganization (C3) a carved graph unlocks.
