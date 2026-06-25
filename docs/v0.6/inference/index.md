---
title: Pillar 3 — Materialization (OWL 2 RL + RDFS)
description: pgRDF forward-chains the OWL 2 RL / RDFS closure via the reasonable reasoner and writes inferences back as queryable rows. Reasoning is single-threaded, so it runs on a right-sized graph — proven on LUBM-100 (laptop) and a 112-million-quad LUBM-500 closure on a single box.
---

# <span class="material-symbols-outlined icon-blue">psychology</span>Pillar 3 — Materialization (OWL 2 RL + RDFS)

`pgrdf.materialize(graph_id BIGINT, profile TEXT DEFAULT 'owl-rl') → JSONB`
runs forward-chaining inference (via the
[`reasonable`](https://github.com/gtfierro/reasonable) reasoner) over
the named graph, and writes every entailed triple back to the same
graph with `is_inferred = TRUE`. The `profile` argument selects the
rule set — **`'owl-rl'`** (default, full OWL 2 RL) or **`'rdfs'`**
(RDFS closures only).

The call is **idempotent**: re-running drops the previously inferred
rows first and replaces them. The base graph is never touched. When
the closure is written, `pgrdf.materialize` refreshes planner
statistics automatically, so SPARQL queries stay fast on the enlarged
graph.

::: warning v0.6 operating model — reason over a right-sized graph
**Ingest is parallel and scales to billions; reasoning is
single-threaded.** Materialization runs the `reasonable` reasoner
in-process on a single core — an upstream limit tracked in
[#1](https://github.com/styk-tv/pgRDF/issues/1) (proposal:
[`gtfierro/reasonable#57`](https://github.com/gtfierro/reasonable/issues/57)).
The [staged bulk loader](/v0.6/storage/staged-loader) ingests the full
8.2-billion-triple Wikidata graph, but `materialize` is **not** for the
billion-scale graph — it runs on a graph sized to your hardware, and
going forward over a **carved slice** of a larger graph
([roadmap](/v0.6/roadmap/)). The proven reasoning regime is
LUBM-100 on a laptop with zero tuning, and a full
**112-million-quad LUBM-500 closure** on a single box. See
[Scale of reasoning](/v0.6/inference/scale).
:::

## Topics in this pillar

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> [**Mental model**](/v0.6/inference/mental-model) — how to think about materialization in pgRDF.
- <span class="material-symbols-outlined">description</span> [**Worked example**](/v0.6/inference/example) — subclass-chain walkthrough you can run in psql.
- <span class="material-symbols-outlined">psychology</span> [**OWL 2 RL rule set**](/v0.6/inference/owl-rl-rules) — what the reasoner actually entails.
- <span class="material-symbols-outlined">settings</span> [**Idempotence + operator safety**](/v0.6/inference/idempotence) — guarantees you can rely on for scheduled jobs.
- <span class="material-symbols-outlined">tune</span> [**Reasoning profile selector**](/v0.6/inference/profile-selector) — `pgrdf.materialize(g, profile)` — `'owl-rl'` + `'rdfs'`.
- <span class="material-symbols-outlined">speed</span> [**Scale of reasoning**](/v0.6/inference/scale) — single-threaded by design; the LUBM-100 and LUBM-500 regimes, and the right-sizing rule.

</div>

## At a glance

```sql
SELECT pgrdf.materialize(100);
--  → {"base_triples": 3, "inferred_triples_written": 11, "profile": "owl-rl", ...}
```

[**Next — Mental model →**](/v0.6/inference/mental-model)

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

Inference is shorter than the other pillars — it's one UDF with a
deep semantic. The recommended path is short and linear:

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> **Start with the [Mental model](/v0.6/inference/mental-model)** — what `is_inferred = TRUE` really means and how materialized quads sit alongside base quads.
- <span class="material-symbols-outlined">description</span> **Walk through the [Worked example](/v0.6/inference/example)** — copy-paste-runnable subclass-chain demo, ~20 lines of SQL.
- <span class="material-symbols-outlined">psychology</span> **Then the [OWL 2 RL rule set](/v0.6/inference/owl-rl-rules)** — what the reasoner actually entails in practice (subclass closure, transitive properties, equivalence, inverse, sameAs).
- <span class="material-symbols-outlined">settings</span> **Read [Idempotence + operator safety](/v0.6/inference/idempotence)** — the guarantees you need before scheduling materialization as a cron job.
- <span class="material-symbols-outlined">tune</span> **Then [Reasoning profile selector](/v0.6/inference/profile-selector)** — pick `'rdfs'` instead of the default `'owl-rl'` when you want to bound per-graph materialization cost.
- <span class="material-symbols-outlined">speed</span> **Finish with [Scale of reasoning](/v0.6/inference/scale)** — why reasoning is single-threaded, and how to size the graph you reason over.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">school</span> [OWL 2 Profiles — RL](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL) — the W3C profile spec pgRDF implements.
- <span class="material-symbols-outlined">school</span> [OWL 2 RL/RDF Rules](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL_in_RIF) — the forward-chaining rules verbatim.
- <span class="material-symbols-outlined">code</span> [`reasonable`](https://github.com/gtfierro/reasonable) — the Rust reasoner pgRDF wraps.
- <span class="material-symbols-outlined">school</span> Pascal Hitzler et al., *Foundations of Semantic Web Technologies* — chapters on OWL 2 RL.

</div>
