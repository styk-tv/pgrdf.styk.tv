# Worked example — minCount + datatype + nodeKind

A complete end-to-end SHACL validation you can run in psql.

## Setup — two graphs

```sql
SELECT pgrdf.add_graph(1);  -- data
SELECT pgrdf.add_graph(2);  -- shapes
```

## Load data — Bob is missing a mailbox

```sql
SELECT pgrdf.parse_turtle('
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix ex:   <http://example.com/> .

ex:alice a foaf:Person ;
    foaf:name "Alice" ;
    foaf:mbox <mailto:alice@example.com> .

ex:bob a foaf:Person ;
    foaf:name "Bob" .   -- intentionally missing foaf:mbox
', 1);
```

## Load shapes

```sql
SELECT pgrdf.parse_turtle('
@prefix sh:   <http://www.w3.org/ns/shacl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix ex:   <http://example.com/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

ex:PersonShape a sh:NodeShape ;
    sh:targetClass foaf:Person ;
    sh:property [
        sh:path foaf:name ;
        sh:minCount 1 ;
        sh:datatype xsd:string ;
    ] ;
    sh:property [
        sh:path foaf:mbox ;
        sh:minCount 1 ;
        sh:nodeKind sh:IRI ;
    ] .
', 2);
```

## Validate

```sql
SELECT pgrdf.validate(1, 2);
```

```json
{
  "conforms": false,
  "results": [
    {
      "focusNode":  "http://example.com/bob",
      "resultPath": "http://xmlns.com/foaf/0.1/mbox",
      "sourceConstraintComponent":
        "http://www.w3.org/ns/shacl#MinCountConstraintComponent",
      "resultSeverity":
        "http://www.w3.org/ns/shacl#Violation",
      "resultMessage": "Less than 1 value"
    }
  ]
}
```

Alice conforms. Bob does not — exactly the constraint we wrote
the shape for.

## Fix the data and re-validate

```sql
SELECT pgrdf.parse_turtle('
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix ex:   <http://example.com/> .
ex:bob foaf:mbox <mailto:bob@example.com> .
', 1);

SELECT pgrdf.validate(1, 2);
--  → { "conforms": true, "results": [] }
```

## Tests

- [`tests/regression/sql/71-shacl-real.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/71-shacl-real.sql)
  — real engine + W3C-shape report, violating case.
- [`tests/regression/sql/70-validate-stub.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/70-validate-stub.sql)
  — back-compat signal that the surface signature didn't break
  when the v0.3 stub was replaced with the real engine.
