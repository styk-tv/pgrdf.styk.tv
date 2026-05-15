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

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

Inference is shorter than the other pillars — it's one UDF with
a deep semantic. The recommended path is short and linear:

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> **Start with the [Mental model](/v0.5/inference/mental-model)** — what `is_inferred = TRUE` really means and how materialised quads sit alongside base quads.
- <span class="material-symbols-outlined">description</span> **Walk through the [Worked example](/v0.5/inference/example)** — copy-paste-runnable subclass-chain demo, ~20 lines of SQL.
- <span class="material-symbols-outlined">psychology</span> **Then the [OWL 2 RL rule set](/v0.5/inference/owl-rl-rules)** — what the reasoner actually entails in practice (subclass closure, transitive properties, equivalence, inverse, sameAs).
- <span class="material-symbols-outlined">settings</span> **Finish with [Idempotence + operator safety](/v0.5/inference/idempotence)** — the guarantees you need before scheduling materialisation as a cron job.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span> **Bonus — [Profile selector](/v0.5/inference/profile-selector)** — the v0.5 forward edge, in case your workload would benefit from `'rdfs'` instead of `'owl-rl'`.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">school</span> [OWL 2 Profiles — RL](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL) — the W3C profile spec pgRDF implements.
- <span class="material-symbols-outlined">school</span> [OWL 2 RL/RDF Rules](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL_in_RIF) — the forward-chaining rules verbatim.
- <span class="material-symbols-outlined">code</span> [`reasonable`](https://github.com/gtfierro/reasonable) — the Rust reasoner pgRDF wraps.
- <span class="material-symbols-outlined">school</span> Pascal Hitzler et al., *Foundations of Semantic Web Technologies* — chapters on OWL 2 RL.
- <span class="material-symbols-outlined">mic</span> **Audio companion** — five episodes covering the inference pillar (see [Training](/v0.5/training#audio-companion)).

</div>
