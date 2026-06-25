---
title: Processes & flows — the operating model
description: pgRDF's operating model as composable verbs you chain with arrows. Import and Seal are parallel and scale with the box; Reason and Validate are single-threaded and want a graph sized to your hardware. The verb reference, the four worked patterns, and how to build your own chain.
---

# <span class="material-symbols-outlined icon-blue">account_tree</span>Processes & flows

> pgRDF's operating model is a set of **composable verbs** you chain
> with arrows. Some verbs are parallel and scale with the box; others
> are single-threaded and want a graph sized to your hardware. This
> section is the verb reference, the worked patterns, and the method
> for building your own chain.

## Two kinds of process

Every verb falls into one of two classes, split by **how it scales**:

| Class | Verbs | Scaling |
|---|---|---|
| **Parallel — scales with the box** | [Import](/v0.6/process/import), [Seal](/v0.6/process/seal) | Fans across a background-worker pool. Add cores → goes faster. Proven on the [full 8.2 B graph](/v0.6/scale/). |
| **Single-threaded — sized to fit** | [Reason](/v0.6/process/reason), [Validate](/v0.6/process/validate) | Runs on one backend. The graph must fit your hardware — you do not reason over the full source graph. |

This is the constraint that shapes every chain: **ingest is parallel,
reasoning is not.** So at scale you ingest the full graph in parallel,
then [carve](/v0.6/process/carve) a right-sized slice and reason over
*that*.

## The verbs

| Verb | Class | Status |
|---|---|---|
| [**Import**](/v0.6/process/import) | parallel | **Shipped** — [staged bulk loader](/v0.6/storage/staged-loader) (`load_turtle`, `load_turtle_staged_run`). |
| [**Seal**](/v0.6/process/seal) | parallel | **Shipped** — the index-build step (the staged loader's concurrent INDEX phase). |
| [**Query**](/v0.6/process/query) | per-query | **Shipped** — full [SPARQL 1.1 surface](/v0.6/query/). |
| [**Reason**](/v0.6/process/reason) | single-threaded | **Shipped** — [OWL 2 RL + RDFS materialization](/v0.6/inference/). |
| [**Validate**](/v0.6/process/validate) | single-threaded | **Shipped** — [SHACL Core 25/25](/v0.6/validation/). |
| [**Carve**](/v0.6/process/carve) | parallel | **Roadmap** — C1/C2 ([roadmap](/v0.6/roadmap/)); manual path today. |
| [**Unload**](/v0.6/process/unload) | — | **Roadmap** — C4 ([roadmap](/v0.6/roadmap/)); manual path today. |

The import-side and reasoning-side verbs are all shipped on v0.6.14.
`Carve` and `Unload` are the verbs the v0.6.n line is building toward
the [v0.7.0 graduation](/v0.6/roadmap/).

## The patterns

Four worked chains cover almost every process. Pick one with
[Choosing a process](/v0.6/process/choosing):

<div class="icon-bullets">

- <span class="material-symbols-outlined">search</span> [**Load → Query**](/v0.6/process/pattern-load-query) — the simplest chain; queryable at any scale.
- <span class="material-symbols-outlined">psychology</span> [**Load → Reason → Query**](/v0.6/process/pattern-reason) — materialize the closure, then query it.
- <span class="material-symbols-outlined">verified</span> [**Load → Validate → Query**](/v0.6/process/pattern-validate) — a SHACL conformance gate.
- <span class="material-symbols-outlined">hub</span> [**Ingest → Carve → Reason**](/v0.6/process/pattern-carve) — scale meets hardware, for sources larger than one backend.

</div>

## Build your own

- [**Building a chain**](/v0.6/process/building-a-chain) — the method: design backwards from the output, make the scaling decision, map verbs to UDFs. Includes the **shape vocabulary** (head · waist · tail) for talking about which step you're on.
- [**Choosing a process**](/v0.6/process/choosing) — the decision table from goal × scale to a pattern.

## See also

<div class="icon-bullets">

- <span class="material-symbols-outlined">query_stats</span> [**Scale & benchmarks**](/v0.6/scale/) — the parallel-ingest ceiling these chains build on.
- <span class="material-symbols-outlined">rocket_launch</span> [**Roadmap**](/v0.6/roadmap/) — the carve / re-encode / park-graph lifecycle landing across v0.6.n.
- <span class="material-symbols-outlined">layers_clear</span> [**The four pillars**](/v0.6/pillars) — the engines the verbs map onto.

</div>
