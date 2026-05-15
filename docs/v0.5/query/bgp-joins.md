# BGP joins

> N triple patterns with shared variables compile to N-way
> self-joins of `_pgrdf_quads`, using the right hexastore index
> per pattern.

## What it does

A SPARQL **Basic Graph Pattern** (BGP) is a list of triple patterns
that all must match. Shared variables across patterns become
**join conditions**. pgRDF translates the BGP to SQL self-joins on
the dictionary-encoded quad table, with each pattern's bound-variable
shape determining which of the three hexastore indexes (SPO / POS /
OSP) the planner uses.

## Why you'd use it

- **Data scientists** — write graph-shaped joins as SPARQL; let
  pgRDF translate to SQL and let Postgres' planner execute.
- **Ontologists** — express composite class membership patterns
  ("an `ex:Engineer` who also `foaf:knows` an `ex:Manager`") with
  the canonical pattern language.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?p ?n ?m
     WHERE { ?p foaf:name ?n .
             ?p foaf:mbox ?m }');
--  → {"p": "http://example.com/alice", "n": "Alice", "m": "mailto:a@x"}
```

The shared variable `?p` across both patterns becomes an inner
join on `subject_id`.

## Tests

- [`tests/w3c-sparql/01-basic-bgp/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/01-basic-bgp/)
- [`tests/regression/sql/31-sparql-bgp.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/31-sparql-bgp.sql)
- [`tests/regression/sql/32-sparql-multipattern.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/32-sparql-multipattern.sql)
