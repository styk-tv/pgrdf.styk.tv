# Solution modifiers — DISTINCT / ORDER BY / LIMIT / OFFSET

> The canonical SPARQL post-processing: `DISTINCT`, `ORDER BY`
> (asc/desc, type-aware), `LIMIT`, `OFFSET`.

## What it does

The standard solution-sequence modifiers all run inside
`pgrdf.sparql` — no need to wrap the call in an outer SQL
`SELECT … DISTINCT … ORDER BY … LIMIT`.

| Modifier | Effect |
|---|---|
| `DISTINCT` | De-duplicate solutions. |
| `ORDER BY ?v` / `ORDER BY DESC(?v)` | Type-aware ordering (numeric for typed numeric literals, lexical otherwise). |
| `LIMIT n` | Bound the result set size. |
| `OFFSET n` | Skip the first `n` solutions. |

`ORDER BY` accepts multiple keys, mixed asc/desc, and
expressions: `ORDER BY ?region DESC(?count) LCASE(?name)`.

## Why you'd use it

- **Data scientists / app developers** — pagination,
  deduplication, top-N ranking inside SPARQL.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'SELECT DISTINCT ?p
     WHERE { ?s ?p ?o }
   ORDER BY ?p LIMIT 20 OFFSET 100');
```

## Tests

- [`tests/w3c-sparql/02-distinct/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/02-distinct/)
- [`tests/w3c-sparql/09-order-by-desc/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/09-order-by-desc/)
- [`tests/w3c-sparql/10-limit-offset/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/10-limit-offset/)
- [`tests/regression/sql/35-sparql-modifiers.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/35-sparql-modifiers.sql)
