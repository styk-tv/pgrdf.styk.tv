# 🚀 Forward edge — profile selector

> A reasoning profile selector on `pgrdf.materialize` so consumers
> can choose between RDFS, OWL 2 RL, and an extended OWL 2 RL+
> rule set per call.

This page is forward-looking. The surface described here is **not
yet callable** on `main`; the materialize UDF currently exposes
only the unparameterised `pgrdf.materialize(graph_id)` signature.

## Target surface

```sql
pgrdf.materialize(
    graph_id BIGINT,
    profile  TEXT DEFAULT 'owl-rl'
) → JSONB
```

| Profile value | Rule set |
|---|---|
| `'rdfs'` | RDFS Plus — `rdfs:subClassOf`, `rdfs:subPropertyOf`, `rdfs:domain`, `rdfs:range` closures only. Faster; cheaper. |
| `'owl-rl'` (default) | OWL 2 RL — the current contract, carried forward unchanged. |
| `'owl-rl-ext'` | OWL 2 RL plus selected DL extensions (TBD; tracked in v0.5-FUTURE LLD). |

## Why it matters

Different workloads benefit from different rule sets:

- **High-throughput ingest pipelines** running thousands of
  graphs an hour may prefer `'rdfs'` to bound the per-graph
  materialization cost.
- **Reasoning-heavy analytical workloads** may want
  `'owl-rl-ext'` for the additional class-construction
  entailments.
- **Default consumers** keep `'owl-rl'`, the W3C-aligned
  middle ground.

## Tracked at

[`SPEC.pgRDF.LLD.v0.5-FUTURE.md §3`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).
