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
