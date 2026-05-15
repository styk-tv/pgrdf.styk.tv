# UNION — disjoint pattern alternatives

> `{ A } UNION { B }` is a real set union of solution mappings.
> Variables only present in one branch are `null` in solutions
> from the other.

## What it does

A SPARQL `UNION` joins the solutions of two patterns into one
output stream. Each branch is evaluated independently; the
combined result preserves variables from both, with `null` where
a variable wasn't bound on the branch that produced a given row.

## Why you'd use it

- **Ontologists** — express "either of these shapes match" without
  writing two queries. Vital for traversing alternative property
  names or class subdivisions in heterogeneous data.
- **Data scientists** — combine views over different sub-graphs
  in one SPARQL call.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n ?m
     WHERE { { ?s foaf:name ?n }
             UNION
             { ?s foaf:mbox ?m } }');
```

Rows from the first branch carry `?n` but `?m = null`; rows from
the second branch carry `?m` but `?n = null`. The shared `?s` is
populated by whichever branch produced the solution.

## Tests

- [`tests/w3c-sparql/03-union-disjoint/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/03-union-disjoint/)
  — W3C §18.2.4 conformance.
- [`tests/regression/sql/37-sparql-union.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/37-sparql-union.sql)
