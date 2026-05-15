# <span class="material-symbols-outlined icon-blue">psychology</span>Pillar 3 — Materialization (OWL 2 RL)

`pgrdf.materialize(graph_id BIGINT) → JSONB` runs OWL 2 RL
forward-chaining inference (via the [`reasonable`](https://github.com/gtfierro/reasonable)
reasoner) over the named graph, and writes every entailed triple
back to the same graph with `is_inferred = TRUE`.

The call is **idempotent**: re-running drops previously inferred
rows first and replaces them. The base graph is never touched.

## Topics in this pillar

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> [**Mental model**](/v0.5/inference/mental-model) — how to think about materialization in pgRDF.
- <span class="material-symbols-outlined">description</span> [**Worked example**](/v0.5/inference/example) — subclass-chain walkthrough you can run in psql.
- <span class="material-symbols-outlined">psychology</span> [**OWL 2 RL rule set**](/v0.5/inference/owl-rl-rules) — what the reasoner actually entails.
- <span class="material-symbols-outlined">settings</span> [**Idempotence + operator safety**](/v0.5/inference/idempotence) — guarantees you can rely on for scheduled jobs.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span> [**Forward edge — profile selector**](/v0.5/inference/profile-selector) — `pgrdf.materialize(g, profile)`.

</div>

## At a glance

```sql
SELECT pgrdf.materialize(100);
--  → {"base_triples": 3, "inferred_triples_written": 11, ...}
```

[**Next — Mental model →**](/v0.5/inference/mental-model)
