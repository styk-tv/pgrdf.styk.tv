# ASK — boolean queries

> `ASK { … }` returns `true` iff the pattern has at least one
> solution.

## What it does

`pgrdf.sparql('ASK { ... }')` returns a single JSONB row
`{"ask": true}` or `{"ask": false}`. Internally pgRDF translates
to a `SELECT EXISTS` against the underlying BGP, so the executor
short-circuits on the first match.

## Why you'd use it

- **Application developers** — existence checks ("does this
  entity have any `foaf:mbox`?") without scanning solutions.
- **Data scientists** — quick assertions on graph shape during
  exploration.
- **Operators** — health-check queries that gate downstream
  processing.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   ASK { ?s a foaf:Person }');
--  → {"ask": true}

SELECT * FROM pgrdf.sparql(
  'ASK { <http://example.com/notreal> ?p ?o }');
--  → {"ask": false}
```

## Tests

- [`tests/w3c-sparql/12-ask-true/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/12-ask-true/)
- [`tests/w3c-sparql/13-ask-false/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/13-ask-false/)
- [`tests/regression/sql/44-sparql-ask.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/44-sparql-ask.sql)
