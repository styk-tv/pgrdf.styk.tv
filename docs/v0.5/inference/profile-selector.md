# Reasoning profile selector

> A reasoning-profile selector on `pgrdf.materialize` lets
> consumers choose between **RDFS** and **OWL 2 RL** per call.
> Shipped in **v0.5.0**.

The materialize UDF takes an optional `profile` argument:

## The surface

```sql
pgrdf.materialize(
    graph_id BIGINT,
    profile  TEXT DEFAULT 'owl-rl'
) → JSONB
```

| Profile value | Rule set |
|---|---|
| `'owl-rl'` (default) | OWL 2 RL — the full forward-chaining rule set documented in [OWL 2 RL rule set](/v0.5/inference/owl-rl-rules). Unchanged default; existing callers keep this behaviour without passing the argument. |
| `'rdfs'` | RDFS closures — `rdfs:subClassOf`, `rdfs:subPropertyOf`, `rdfs:domain`, `rdfs:range`. Faster and cheaper than full OWL 2 RL. |

```sql
-- Default: OWL 2 RL (back-compatible — no argument needed).
SELECT pgrdf.materialize(100);

-- Bound the per-graph cost to the RDFS closures only.
SELECT pgrdf.materialize(100, 'rdfs');
```

Both profiles are idempotent in the same way the default call is
— re-running drops the previously inferred rows and replaces
them. See [Idempotence + operator safety](/v0.5/inference/idempotence).

## Why it matters

Different workloads benefit from different rule sets:

- **High-throughput ingest pipelines** running thousands of
  graphs an hour can choose `'rdfs'` to bound the per-graph
  materialization cost.
- **Default consumers** keep `'owl-rl'`, the W3C-aligned
  middle ground, with no code change.

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>v0.6-FUTURE — `'owl-rl-ext'`

An extended `'owl-rl-ext'` profile (OWL 2 RL plus selected DL
extensions) is on the post-v0.5 backlog, tracked in
[`SPEC.pgRDF.LLD.v0.5-FUTURE.md §3`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).
It is not callable today; `'owl-rl'` and `'rdfs'` are the two
shipped v0.5.0 profiles.
