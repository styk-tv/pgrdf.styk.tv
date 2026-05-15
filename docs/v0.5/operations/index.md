# <span class="material-symbols-outlined">build</span>Operations

The operator-facing surface: observability, cache control,
SQL composition, multi-PG support, install.

These aren't a fifth pillar — they're the seams that let the
four pillars compose cleanly inside Postgres.

## In this section

<div class="icon-bullets">

- <span class="material-symbols-outlined">query_stats</span> [**`pgrdf.stats()` observability**](/v0.5/operations/stats) — JSONB health snapshot.
- <span class="material-symbols-outlined">layers_clear</span> [**Cache control**](/v0.5/operations/cache-control) — explicit invalidation for the dictionary cache.
- <span class="material-symbols-outlined">bolt</span> [**Prepared-plan cache**](/v0.5/operations/plan-cache) — SPARQL→SQL plan reuse per backend.
- <span class="material-symbols-outlined">hub</span> [**Compose with regular SQL**](/v0.5/operations/sql-composition) — `pgrdf.sparql` as a set-returning function.
- <span class="material-symbols-outlined">settings</span> [**Multi-version Postgres support**](/v0.5/operations/multi-pg).
- <span class="material-symbols-outlined">build</span> [**Drop-in install**](/v0.5/operations/install).

</div>

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

A two-pass learning order for operators stewarding a pgRDF
deployment:

### First pass — get it installed and observable

<div class="icon-bullets">

- <span class="material-symbols-outlined">build</span> **[Drop-in install](/v0.5/operations/install)** — three artefacts bind-mounted onto a stock `postgres:17.4` image. The five-minute path.
- <span class="material-symbols-outlined">settings</span> **[Multi-version Postgres support](/v0.5/operations/multi-pg)** — PG 14, 15, 16, 17, with explicit `pg*` feature flags.
- <span class="material-symbols-outlined">query_stats</span> **[`pgrdf.stats()` observability](/v0.5/operations/stats)** — the JSONB key contract you scrape into Prometheus.

</div>

### Second pass — tune and compose

<div class="icon-bullets">

- <span class="material-symbols-outlined">bolt</span> **[Prepared-plan cache](/v0.5/operations/plan-cache)** — how SPARQL→SQL plans get reused per backend; how to size it.
- <span class="material-symbols-outlined">layers_clear</span> **[Cache control](/v0.5/operations/cache-control)** — explicit invalidation primitives for the dictionary and plan caches.
- <span class="material-symbols-outlined">hub</span> **[Compose with regular SQL](/v0.5/operations/sql-composition)** — how to wire `pgrdf.sparql` into views, ORMs, BI tools, and `INSERT INTO ... SELECT` pipelines.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">school</span> [`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md) — the canonical install spec (per-PG tarball layout, K8s init-container variant).
- <span class="material-symbols-outlined">school</span> Postgres operational guides — `pg_stat_statements`, `pg_stat_activity`, `EXPLAIN` — the standard tooling you'll combine with `pgrdf.stats()`.
- <span class="material-symbols-outlined">mic</span> **Audio companion** — six episodes covering operations (see [Training](/v0.5/training#audio-companion)).

</div>
