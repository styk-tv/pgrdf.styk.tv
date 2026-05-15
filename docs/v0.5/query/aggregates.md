# Aggregates + GROUP BY

> `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP_CONCAT`, `SAMPLE` —
> all standard SPARQL 1.1 aggregates. `MIN` / `MAX` are
> type-aware.

## What it does

All seven SPARQL 1.1 aggregate functions translate to SQL
aggregates over the dynamically-translated query. `MIN` and `MAX`
are **type-aware** — they pick numeric ordering over numeric
literals and lexical ordering over strings, so you don't get the
SPARQL-foot-gun where `"10"^^xsd:integer < "9"^^xsd:integer`
because of string comparison.

| Function | SQL equivalent | Notes |
|---|---|---|
| `COUNT(?v)` | `count(...)` | DISTINCT supported. |
| `SUM(?v)` | `sum(...)` | Numeric typed literals. |
| `AVG(?v)` | `avg(...)` | Returns `xsd:decimal`. |
| `MIN(?v)` / `MAX(?v)` | per-type ordering | Numeric vs. lexical chosen by the executor. |
| `GROUP_CONCAT(?v; SEPARATOR=",")` | `string_agg(...)` | Custom separator. |
| `SAMPLE(?v)` | arbitrary first row | One value per group. |

## Why you'd use it

- **Project managers** — graph-shape reports in one query: counts
  per predicate, sums per category, distinct value samples.
- **Data scientists** — bread-and-butter analytical queries
  inside SPARQL, no client-side post-process.

## Example

```sql
-- Triple count per predicate.
SELECT * FROM pgrdf.sparql(
  'SELECT ?p (COUNT(?o) AS ?n)
     WHERE { ?s ?p ?o }
   GROUP BY ?p
   ORDER BY DESC(?n)');
--  → {"p": "http://xmlns.com/foaf/0.1/name", "n": "4"}
```

`COUNT(?o)` and `?o` is a variable — pgRDF counts non-`null`
bindings. Use `COUNT(*)` for an unconditional count.

## Tests

- [`tests/w3c-sparql/07-aggregates-count/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/07-aggregates-count/)
- [`tests/w3c-sparql/23-min-max-numeric/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/23-min-max-numeric/)
- [`tests/regression/sql/39-sparql-aggregates.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/39-sparql-aggregates.sql)
