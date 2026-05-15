# OPTIONAL — left-outer-join semantics

> `OPTIONAL { … }` is a left outer join. Variables only bound in
> the optional branch come through as `null` when the branch
> didn't match.

## What it does

A SPARQL `OPTIONAL` clause says **"include this pattern if it
matches, but don't drop the outer solution if it doesn't."**
pgRDF translates it to a SQL `LEFT JOIN` against the relevant
quad-table scan.

## Why you'd use it

- **Data scientists** — real-world data is sparse. OPTIONAL lets
  a single query return all matching subjects, with optional
  fields blank where absent.
- **Ontologists** — express the canonical "find all instances
  of class X, with their optional foo property" pattern.
- **Application developers** — `null` round-trips into JSON / your
  ORM cleanly; no separate "did this match" boolean to track.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n ?m
     WHERE { ?s foaf:name ?n
             OPTIONAL { ?s foaf:mbox ?m } }');
```

```json
{"s": "http://example.com/alice", "n": "Alice", "m": "mailto:a@x"}
{"s": "http://example.com/bob",   "n": "Bob",   "m": null}
```

The canonical "find rows that *don't* match the OPTIONAL" pattern
uses `!BOUND(?m)`:

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n
     WHERE { ?s foaf:name ?n
             OPTIONAL { ?s foaf:mbox ?m }
             FILTER(!BOUND(?m)) }');
--  → people with a name but no mailbox
```

## Tests

- [`tests/w3c-sparql/04-optional-chain/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/04-optional-chain/)
- [`tests/w3c-sparql/19-bound-after-optional/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/19-bound-after-optional/)
- [`tests/regression/sql/36-sparql-optional.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/36-sparql-optional.sql)
