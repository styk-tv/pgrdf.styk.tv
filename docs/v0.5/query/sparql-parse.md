# `sparql_parse` — inspect without executing

> Returns the parsed algebra shape as JSONB. Useful for tools and
> validation upstream of `sparql`.

## What it does

`pgrdf.sparql_parse(query TEXT) → JSONB`

Parses a SPARQL query through `spargebra` and returns a JSONB
report of the algebra shape — form (SELECT / ASK / UPDATE /
CONSTRUCT / DESCRIBE), projection variables, BGP triple count,
modifiers in use, and a list of unsupported algebra operators
encountered. No query execution; no data access.

## Why you'd use it

- **Application developers** — statically reject queries that use
  unsupported features before they hit the database. Stable JSON
  contract for tooling.
- **Operators** — log incoming SPARQL workload shape (form
  distribution, average BGP size) without joining the database
  audit trail.
- **Data scientists** — a quick `EXPLAIN`-style sanity check
  during query authoring.

## Example

```sql
SELECT pgrdf.sparql_parse(
  'SELECT ?s WHERE { ?s ?p ?o
                     OPTIONAL { ?s <http://x/n> ?n } }');
```

```json
{
  "form":                "SELECT",
  "projection":          ["s"],
  "bgp_triples":         1,
  "modifiers":           ["LeftJoin"],
  "unsupported_algebra": []
}
```

A query that uses a yet-unsupported feature (e.g. CONSTRUCT) shows
up in `unsupported_algebra`:

```sql
SELECT pgrdf.sparql_parse('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }');
--  → {"form": "CONSTRUCT", ..., "unsupported_algebra": ["Construct"]}
```

## Tests

- [`tests/regression/sql/30-sparql-parse.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/30-sparql-parse.sql)
- [`tests/regression/sql/66-parse-sparql-roundtrip.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/66-parse-sparql-roundtrip.sql)
