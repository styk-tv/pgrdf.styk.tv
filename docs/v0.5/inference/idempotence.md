# Idempotence + operator safety

> `pgrdf.materialize(g)` is idempotent. Re-run as often as you
> like; the prior `is_inferred = TRUE` rows are dropped first.
> The base graph is untouched.

## The contract

| Property | Guaranteed by |
|---|---|
| Re-running yields the **same shape** of return JSONB | Algorithm is deterministic on the base graph |
| Re-running does **not** duplicate inferred rows | Prior `is_inferred = TRUE` rows are deleted before re-emit |
| Base rows are **never** touched | Only rows with `is_inferred = TRUE` are removed |
| Empty graph → `base_triples = 0`, non-negative inferred count | Locked by regression test |
| Inferred count is always `≥ 0` | Locked by regression test |
| A new `materialize` call after editing the base graph reflects the new base | Reasoner reads `is_inferred = FALSE` rows only as input |

## Why this matters to operators

Operators can wire materialization into:

- **A nightly cron** — the call is safe to re-run, drift between
  inferred and base sets is eliminated each run.
- **A trigger on bulk-ingest completion** — call `materialize`
  at the tail of an ingest batch, no special "first run vs.
  subsequent" branching needed.
- **An on-demand SQL function** — users can re-materialize during
  development without polluting the inferred set.

## Worked example

```sql
SELECT pgrdf.materialize(100);
--  → {"base_triples": 3, "inferred_triples_written": 11, ...}

SELECT pgrdf.materialize(100);
--  → {"base_triples": 3, "inferred_triples_written": 11, ...}
-- Same result. No row duplication.

-- Now edit the base graph.
SELECT pgrdf.parse_turtle('
@prefix ex: <http://example.com/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
ex:bob rdf:type ex:Engineer .
', 100);

SELECT pgrdf.materialize(100);
--  → {"base_triples": 4, "inferred_triples_written": 14, ...}
-- Base is now 4; inferred count grew accordingly.
```

## Empty-graph safety

```sql
SELECT pgrdf.add_graph(999);
-- No data loaded.
SELECT pgrdf.materialize(999);
--  → {"base_triples": 0, "inferred_triples_written": 0, ...}
-- Safe; no error.
```

## Tests

- [`tests/regression/sql/62-materialize-empty.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/62-materialize-empty.sql)
  — empty-graph contract + double-call idempotence + non-negative
  inferred count.
- [`tests/regression/sql/60-materialize-owl-rl.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/60-materialize-owl-rl.sql)
  — OWL 2 RL correctness over a non-trivial subclass chain.
