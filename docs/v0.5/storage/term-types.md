# Term types — typed literals, language tags, blank nodes, RDF lists

> Turtle ingest preserves the full RDF term-type space: IRIs,
> plain literals, datatyped literals, language-tagged literals,
> blank nodes, and RDF collections.

## What it does

The Turtle parser round-trips every term species the standard
defines:

| Term type | Example in Turtle | Stored as |
|---|---|---|
| IRI | `<http://example.org/alice>` | `term_type = 1` |
| Plain literal | `"hello"` | `term_type = 2`, no datatype tag |
| Datatyped literal | `"42"^^xsd:integer` | `term_type = 2`, datatype IRI in lexical form |
| Language-tagged literal | `"colour"@en-GB` | `term_type = 2`, lang tag in lexical form |
| Blank node | `_:b1` or `[ … ]` | `term_type = 3` |
| RDF collection | `( a b c )` | Expands to `rdf:first` / `rdf:rest` / `rdf:nil` chain |

## Why you'd use it

- **Data scientists** — numeric or language-conditional FILTERs
  on real data work because the type is preserved at ingest
  time, not stripped to plain strings.
- **Ontologists** — load OWL, SHACL, PROV-O and similar
  vocabularies with confidence that the datatype assertions
  round-trip.
- **Project managers** — the on-disk representation matches the
  W3C spec; no lossy normalisation surprises downstream.

## Example

```sql
SELECT pgrdf.add_graph(10);

SELECT pgrdf.parse_turtle('
@prefix ex:   <http://example.com/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:alice ex:name "Alice"@en ;
         ex:age  "30"^^xsd:integer ;
         ex:notes [ ex:source "manual" ] ;
         ex:tags  ( "engineer" "rust" "rdf" ) .
', 10);
--  → 8  (4 explicit + RDF list expansion)
```

Numeric FILTER over a typed literal then works as expected:

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX ex:  <http://example.com/>
   PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
   SELECT ?s ?a
     WHERE { ?s ex:age ?a FILTER(?a >= 18) }');
--  → {"s": "http://example.com/alice", "a": "\"30\"^^xsd:integer"}
```

Language tag FILTER:

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   SELECT ?n WHERE { ?s ex:name ?n FILTER(LANG(?n) = "en") }');
```

## Tests

- [`tests/regression/sql/21-typed-literals.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/21-typed-literals.sql)
- [`tests/regression/sql/22-lang-tags.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/22-lang-tags.sql)
- [`tests/regression/sql/23-blank-nodes.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/23-blank-nodes.sql)
- [`tests/regression/sql/24-rdf-list.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/24-rdf-list.sql)
- [`tests/w3c-sparql/17-lang-tag/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/17-lang-tag/)
- [`tests/w3c-sparql/21-numeric-filter/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-sparql/21-numeric-filter/)

## See also

- [Hexastore + dictionary](/v0.5/storage/hexastore).
- [FILTER expressions](/v0.5/query/filter).
