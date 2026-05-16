# Error-message contract — stable prefixes

> Unsupported SPARQL shapes and UDF failures emit **stable error
> prefixes** locked by regression tests, so client code can match
> on them.

## What it does

pgRDF exposes a closed set of human-readable error prefixes for
the failure modes a client is likely to care about:

| Trigger | Error prefix |
|---|---|
| A spec-permitted out-of-scope shape (negated property sets, explicit sequence path-expr, the gated nested-recursive path remainder) | `pgrdf.sparql: unsupported algebra: <name>` |
| `load_turtle` with a missing file | `load_turtle: failed to open` |
| Invalid Turtle | `pgrdf.parse_turtle: parse error: …` |
| Invalid SPARQL | `pgrdf.sparql_parse: parse error: …` |
| `validate` on a non-existent graph | `pgrdf.validate: graph <N> not found` |

Tests assert the **prefix** stays stable — the trailing detail
can vary by Postgres major or by the underlying parser version,
but the prefix is the contract.

## Why you'd use it

- **Application developers** — branch on the failure mode in
  client code reliably: "this query uses CONSTRUCT, route to a
  different code path" instead of brittle substring guessing.
- **Operators** — alert rules can match prefixes to bucket
  failures.

## Example

```sql
-- Programmatic detection of a spec-permitted out-of-scope shape.
-- CONSTRUCT, DESCRIBE, and property paths are all supported in
-- v0.5.0 — the example below uses a negated property set, which
-- is a deliberate, documented out-of-scope gap.
DO $$
DECLARE
    result jsonb;
BEGIN
    BEGIN
        SELECT pgrdf.sparql('SELECT ?s WHERE { ?s !(<http://x/p>) ?o }')
          INTO result;
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE 'pgrdf.sparql: unsupported algebra:%' THEN
            -- log, skip, or rewrite the query
            RAISE NOTICE 'negated property set is out of scope';
        ELSE
            RAISE;
        END IF;
    END;
END $$;
```

## Tests

- [`tests/regression/sql/80-unsupported-shapes.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/80-unsupported-shapes.sql)
  — 7 locked negative signals for unsupported SPARQL.
- [`tests/regression/sql/81-error-paths.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/81-error-paths.sql)
  — UDF error prefixes (first lock-in:
  `load_turtle: failed to open`).
