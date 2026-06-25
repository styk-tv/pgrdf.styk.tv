# MINUS — set difference

> `MINUS { … }` removes solutions that are compatible with any
> binding of the MINUS branch. With no shared variables, MINUS
> elides (W3C §8.3.2).

## What it does

`MINUS` is SPARQL's set-difference operator over solution
mappings. A solution `μ` from the outer pattern is removed if
there's any solution `ν` from the MINUS pattern such that
`μ` and `ν` agree on all shared variables.

The elision rule for no-shared-variables follows the W3C spec:
without a shared variable, no solution `μ` can be "compatible
with" any `ν`, so MINUS removes nothing.

## Why you'd use it

- **Data scientists** — "all X but not Y" without writing a
  correlated subquery.
- **Ontologists** — instance counts excluding a deprecated
  sub-class, members of a class without a specific property
  asserted, and similar set-difference patterns.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s
     WHERE { ?s a foaf:Person
             MINUS { ?s foaf:mbox ?m } }');
--  → people without a foaf:mbox
```

## Tests

- [`tests/w3c-sparql/05-minus-no-shared/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/05-minus-no-shared/)
  — W3C §8.3.2 elision rule.
- [`tests/regression/sql/38-sparql-minus.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/38-sparql-minus.sql)
- [`tests/regression/sql/43-sparql-minus-multi.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/43-sparql-minus-multi.sql)
