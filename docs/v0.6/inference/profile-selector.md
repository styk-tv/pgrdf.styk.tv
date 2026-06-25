---
title: Reasoning profile selector
description: The profile argument on pgrdf.materialize selects RDFS or full OWL 2 RL per call — 'owl-rl' (default) or 'rdfs' (schema closures only), to bound per-graph materialization cost. Unknown profiles error, no silent fallback.
---

# Reasoning profile selector

> A reasoning-profile selector on `pgrdf.materialize` lets consumers
> choose between **RDFS** and **OWL 2 RL** per call.

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
| `'owl-rl'` (default) | OWL 2 RL — the full forward-chaining rule set documented in [OWL 2 RL rule set](/v0.6/inference/owl-rl-rules). Unchanged default; existing callers keep this behaviour without passing the argument. |
| `'rdfs'` | RDFS closures — `rdfs:subClassOf`, `rdfs:subPropertyOf`, `rdfs:domain`, `rdfs:range`. A strict, sound, complete subset of `'owl-rl'`. Faster and cheaper per graph. |
| any other string | Errors `materialize: unknown profile …` — **no silent fallback**. |

```sql
-- Default: OWL 2 RL (back-compatible — no argument needed).
SELECT pgrdf.materialize(100);

-- Bound the per-graph cost to the RDFS closures only.
SELECT pgrdf.materialize(100, 'rdfs');

-- Unknown profile → error, not a fallback:
SELECT pgrdf.materialize(100, 'bogus');
-- ERROR: materialize: unknown profile "bogus" …
```

The returned JSONB stats object carries a `profile` field reflecting
the requested profile. The `'rdfs'` profile is pure pgRDF code, so its
`reasoner_errors` array is always empty.

Both profiles are idempotent in the same way the default call is —
re-running drops the previously inferred rows and replaces them. See
[Idempotence + operator safety](/v0.6/inference/idempotence).

## Why it matters

Different workloads benefit from different rule sets:

- **High-throughput ingest pipelines** running many graphs an hour can
  choose `'rdfs'` to bound the per-graph materialization cost. Because
  reasoning is single-threaded ([#1](https://github.com/styk-tv/pgRDF/issues/1)),
  trimming the rule set is one of the levers that keeps a
  [right-sized graph](/v0.6/inference/scale) inside the batch window.
- **Default consumers** keep `'owl-rl'`, the W3C-aligned middle
  ground, with no code change.

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Forward edge — `'owl-rl-ext'`

An extended `'owl-rl-ext'` profile (OWL 2 RL plus selected DL
extensions) is reserved on the forward backlog — see the
[roadmap](/v0.6/roadmap/). It is not callable today: requesting it
returns the unknown-profile error above. `'owl-rl'` and `'rdfs'` are
the two shipped profiles.
