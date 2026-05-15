# BIND — project computed values

> `BIND(expr AS ?v)` adds a new variable bound to a SPARQL
> expression — string concatenation, arithmetic, IRI
> manipulation — visible in subsequent patterns and in the SELECT
> projection.

## What it does

`BIND` is SPARQL's general-purpose "let me compute something and
give it a name" construct. The expression is evaluated per
solution; the new variable becomes part of the solution from that
point forward.

Supported expression surface: anything the
[FILTER](/v0.5/query/filter) page lists — equality, ordering,
boolean, term-type tests, regex, numeric arithmetic, string
functions.

## Why you'd use it

- **Data scientists** — compose a display name from given +
  family name, build a derived IRI, attach a constant tag — all
  in-query.
- **Ontologists** — provide canonical projection of compound
  values without modifying the source graph.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?full
     WHERE { ?s foaf:givenName ?g .
             ?s foaf:familyName ?fam .
             BIND(CONCAT(?g, " ", ?fam) AS ?full) }');
```

## Tests

- [`tests/w3c-sparql/11-bind-concat/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/11-bind-concat/)
- [`tests/regression/sql/42-sparql-bind.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/42-sparql-bind.sql)
