---
title: Reason — the materialization verb
description: Reason forward-chains OWL 2 RL and RDFS entailments and writes them back as queryable quads. Backed by pgrdf.materialize. It is single-threaded by design, so it runs over a graph sized to your hardware — the constraint that motivates carving.
---

# <span class="material-symbols-outlined icon-orange">psychology</span>Reason

> Materialize the implicit consequences of a graph — subclass,
> subproperty, equivalence, inverse, transitive — and write them back
> as queryable quads. **Reason** is single-threaded, so it runs over a
> graph **sized to your hardware**.

## What it is

Reason forward-chains the entailment closure under a chosen profile and
writes every inferred triple back into the same partition as
`is_inferred = TRUE` rows. After Reason, a [Query](/v0.6/process/query)
sees both asserted and entailed triples. The call is **idempotent** —
prior inferred rows are dropped and re-derived each run — and it
refreshes planner statistics automatically.

## How you run it

```sql
pgrdf.materialize(graph_id BIGINT, profile TEXT DEFAULT 'owl-rl') → JSONB
```

The `profile` selects the closure:

- **`'owl-rl'`** (default) — full OWL 2 RL forward-chaining.
- **`'rdfs'`** — RDFS closures only.

An unknown profile raises an error — there is no silent fallback. See
[Pillar 3 — Materialization](/v0.6/inference/) for the rule set.

## Where it sits in a chain

**After [Seal](/v0.6/process/seal), before [Validate](/v0.6/process/validate)
and [Query](/v0.6/process/query).** Reason is the verb that decides
whether you need to carve: if the graph is larger than one backend can
close over, you [Carve](/v0.6/process/carve) a right-sized slice and
reason over that.

::: warning Scaling class — single-threaded
Reason runs on **one backend**. OWL-RL materialization is
single-thread-bound upstream in the
[`reasonable`](https://github.com/gtfierro/reasonable) reasoner
([issue #1](https://github.com/styk-tv/pgRDF/issues/1)). This is the
binding constraint of the operating model: you do **not** reason over
the full 8.2 B source graph on ordinary hardware — you reason over a
graph sized to your box. See [Reasoning at scale](/v0.6/inference/scale).
:::

## Example

```sql
-- ex:alice a ex:Engineer ; ex:Engineer ⊑ ex:Person ⊑ ex:Agent
SELECT pgrdf.materialize(100);
--  → {"base_triples": 3, "inferred_triples_written": 11, ...}

-- the 2-hop entailment is now queryable
SELECT * FROM pgrdf.sparql(
  'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX ex: <http://example.com/>
   SELECT ?c WHERE { ex:alice rdf:type ?c }');
--  → ex:Engineer (base), ex:Person (inferred), ex:Agent (inferred)
```

## See also

- [Pillar 3 — Materialization](/v0.6/inference/) — the OWL 2 RL + RDFS rule set.
- [Reasoning at scale](/v0.6/inference/scale) — why reasoning runs on a sized slice.
- [Carve](/v0.6/process/carve) — the roadmap verb that right-sizes a graph for Reason.
