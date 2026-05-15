# Operations

The operator-facing surface: observability, cache control,
SQL composition, multi-PG support, install.

These aren't a fifth pillar — they're the seams that let the
four pillars compose cleanly inside Postgres.

## In this section

- [**`pgrdf.stats()` observability**](/v0.4/operations/stats) —
  JSONB health snapshot.
- [**Cache control**](/v0.4/operations/cache-control) — explicit
  invalidation for the dictionary cache.
- [**Prepared-plan cache**](/v0.4/operations/plan-cache) —
  SPARQL→SQL plan reuse per backend.
- [**Compose with regular SQL**](/v0.4/operations/sql-composition) —
  `pgrdf.sparql` as a set-returning function.
- [**Multi-version Postgres support**](/v0.4/operations/multi-pg).
- [**Drop-in install**](/v0.4/operations/install).
