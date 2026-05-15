# Worked example — subclass chain

A two-hop `rdfs:subClassOf` example you can copy-paste into psql
and watch run end-to-end.

## Setup

```sql
SELECT pgrdf.add_graph(100);

SELECT pgrdf.parse_turtle('
@prefix ex:   <http://example.com/> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:Engineer rdfs:subClassOf ex:Person .
ex:Person   rdfs:subClassOf ex:Agent .
ex:alice    rdf:type        ex:Engineer .
', 100);
--  → 3
```

We've stated three things explicitly. Without materialization, a
query asking "what types does Alice have?" returns only the one
that was asserted directly:

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX ex:   <http://example.com/>
   SELECT ?c WHERE { ex:alice rdf:type ?c }');
--  → {"c": "http://example.com/Engineer"}
```

## Materialize

```sql
SELECT pgrdf.materialize(100);
```

```json
{
  "base_triples":              3,
  "inferred_triples_written":  11,
  "total_after":               14,
  "elapsed_ms":                12.3
}
```

The reasoner emits 11 new triples. (The exact count varies with
the OWL 2 RL closure — it includes RDFS-style class declarations
like `ex:Person rdf:type rdfs:Class`, plus the transitive type
assertions.)

## Query again

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX ex:   <http://example.com/>
   SELECT ?c WHERE { ex:alice rdf:type ?c }');
--  → {"c": "http://example.com/Engineer"}   ← base
--  → {"c": "http://example.com/Person"}     ← inferred
--  → {"c": "http://example.com/Agent"}      ← inferred
```

The transitive subclass chain is now queryable as flat rows. Your
application can ask "is Alice an Agent?" and get yes, without
implementing the closure itself.

## Inspect the breakdown

```sql
-- See which rows are inferred vs. base.
SELECT
    d_p.value AS predicate,
    d_o.value AS object,
    q.is_inferred
  FROM pgrdf._pgrdf_quads q
  JOIN pgrdf._pgrdf_dictionary d_s ON d_s.id = q.subject_id
  JOIN pgrdf._pgrdf_dictionary d_p ON d_p.id = q.predicate_id
  JOIN pgrdf._pgrdf_dictionary d_o ON d_o.id = q.object_id
  WHERE q.graph_id = 100
    AND d_s.value = 'http://example.com/alice'
  ORDER BY q.is_inferred;
```

## Re-run is safe

```sql
SELECT pgrdf.materialize(100);
-- Same result. is_inferred=TRUE rows are dropped + re-emitted.
-- base_triples and the inferred count stay stable.
```

See [Idempotence + operator safety](/v0.4/inference/idempotence) for
the contract.

## Tests

- [`tests/regression/sql/60-materialize-owl-rl.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/60-materialize-owl-rl.sql)
- [`tests/regression/sql/61-materialize-then-sparql.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/61-materialize-then-sparql.sql)
