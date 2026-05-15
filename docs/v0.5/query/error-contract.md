# Error-message contract — stable prefixes

> Unsupported SPARQL shapes and UDF failures emit **stable error
> prefixes** locked by regression tests, so client code can match
> on them.

## What it does

pgRDF exposes a closed set of human-readable error prefixes for
the failure modes a client is likely to care about:

| Trigger | Error prefix |
|---|---|
| Unsupported SPARQL algebra (CONSTRUCT, property paths, …) | `pgrdf.sparql: unsupported algebra: <name>` |
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
-- Programmatic detection of an unsupported shape:
DO $$
DECLARE
    result jsonb;
BEGIN
    BEGIN
        SELECT pgrdf.sparql_parse('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')
          INTO result;
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE 'pgrdf.sparql: unsupported algebra:%' THEN
            -- route to the v0.5 endpoint, or log, or skip
            RAISE NOTICE 'CONSTRUCT not yet supported';
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
