# FILTER — boolean composition over solutions

> Equality, ordering, boolean composition, term-type tests,
> `bound`, `in`, `regex`, numeric comparison, string functions.

## What it does

A `FILTER` expression evaluates a boolean over each candidate
solution; only the truthy solutions survive. pgRDF supports the
full SPARQL 1.1 expression surface that the underlying
`spargebra` algebra and the executor can translate to SQL:

| Class | Operators / functions |
|---|---|
| Comparison | `=`, `!=`, `<`, `<=`, `>`, `>=` |
| Boolean | `&&`, `\|\|`, `!` |
| Term-type tests | `isIRI`, `isLiteral`, `isBlank`, `isNumeric` |
| Binding tests | `bound(?v)` |
| Set tests | `?v IN (a, b, c)`, `?v NOT IN (...)` |
| Regex | `REGEX(?v, "pat", "flags")` |
| Numeric | type-aware on `xsd:integer`, `xsd:decimal`, `xsd:double` |
| String | `STRLEN`, `UCASE`, `LCASE`, `STR`, `LANG` |

## Why you'd use it

- **Data scientists** — apply text-search and numeric predicates
  inside the SPARQL pattern, not in a post-process.
- **Ontologists** — carve subgraphs declaratively without writing
  SQL `CASE` ladders.

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n
     WHERE { ?s foaf:name ?n .
             ?s <http://example.com/age> ?age
             FILTER(?age >= 30 && REGEX(?n, "^A", "i")) }');
```

Term-type filter:

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?o
     WHERE { ?s ?p ?o FILTER(isIRI(?o) && ?p = foaf:knows) }');
```

## Tests

- [`tests/regression/sql/33-sparql-filter.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/33-sparql-filter.sql)
- [`tests/regression/sql/34-sparql-filter-advanced.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/34-sparql-filter-advanced.sql)
- [`tests/regression/sql/41-sparql-expressions.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/41-sparql-expressions.sql)
- [`tests/w3c-sparql/06-filter-isiri/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/06-filter-isiri/)
- [`tests/w3c-sparql/14-filter-regex/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/14-filter-regex/)
- [`tests/w3c-sparql/15-filter-in/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/15-filter-in/)
- [`tests/w3c-sparql/21-numeric-filter/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/21-numeric-filter/)
- [`tests/w3c-sparql/17-lang-tag/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/17-lang-tag/)
- [`tests/w3c-sparql/16-strlen/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/16-strlen/)
- [`tests/w3c-sparql/18-ucase/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/18-ucase/)
- [`tests/w3c-sparql/20-str-iri/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/20-str-iri/)
