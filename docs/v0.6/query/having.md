# HAVING — post-aggregate FILTER

> `HAVING` filters after grouping. Two equivalent shapes both
> work: referring to the alias, and inline aggregate.

## What it does

A `HAVING` clause filters the post-aggregation result set — the
SQL equivalent of `HAVING` rather than `WHERE`. pgRDF accepts
both forms:

1. **Alias-referenced** — `HAVING(?friends > 1)` where `?friends`
   was projected via `AS`.
2. **Inline aggregate** — `HAVING(SUM(?v) > 10)` where the
   aggregate is re-stated in the filter expression.

## Why you'd use it

- **Data scientists** — "predicates with more than N usages,"
  "properties whose value-sum exceeds a threshold," answerable
  in a single query.

## Example — alias-referenced

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s (COUNT(?o) AS ?friends)
     WHERE { ?s foaf:knows ?o }
   GROUP BY ?s
   HAVING(?friends > 1)');
```

## Example — inline aggregate

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   SELECT ?s
     WHERE { ?s ex:cost ?c }
   GROUP BY ?s
   HAVING(SUM(?c) > 1000)');
```

## Tests

- [`tests/w3c-sparql/08-aggregates-having/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/08-aggregates-having/)
  — alias-referenced.
- [`tests/w3c-sparql/22-having-inline-aggregate/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/22-having-inline-aggregate/)
  — inline aggregate.
- [`tests/regression/sql/40-sparql-having.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/40-sparql-having.sql)
