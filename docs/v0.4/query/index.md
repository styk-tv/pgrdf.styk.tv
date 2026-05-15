# Pillar 2 — Semantic query (SPARQL 1.1)

`pgrdf.sparql(q TEXT) → SETOF JSONB` parses SPARQL with
[`spargebra`](https://crates.io/crates/spargebra), translates the
algebra to dynamic SQL against the [hexastore quad
tables](/v0.4/storage/hexastore), executes it, and yields one
JSONB row per solution.

Solution variables become JSONB keys; unbound variables come
through as `null`.

## Surface in this pillar

- [**BGP joins**](/v0.4/query/bgp-joins) — N-pattern joins.
- [**FILTER**](/v0.4/query/filter) — boolean composition + term-type tests.
- [**OPTIONAL**](/v0.4/query/optional) — left outer join.
- [**UNION**](/v0.4/query/union) — disjoint pattern alternatives.
- [**MINUS**](/v0.4/query/minus) — set difference.
- [**Aggregates**](/v0.4/query/aggregates) — `COUNT`, `SUM`, `AVG`, `MIN`/`MAX`, `GROUP_CONCAT`, `SAMPLE`.
- [**HAVING**](/v0.4/query/having) — post-aggregate FILTER.
- [**BIND**](/v0.4/query/bind) — project computed values.
- [**Solution modifiers**](/v0.4/query/modifiers) — `DISTINCT`, `ORDER BY`, `LIMIT`, `OFFSET`.
- [**ASK**](/v0.4/query/ask) — boolean queries.
- [**GRAPH `<iri> { … }`**](/v0.4/query/graph-clause) — named-graph scoping.
- [**`sparql_parse`**](/v0.4/query/sparql-parse) — inspect without executing.
- [**Error-message contract**](/v0.4/query/error-contract) — stable error prefixes.
- [**Forward edge (v0.5)**](/v0.4/query/roadmap) — UPDATE, CONSTRUCT, property paths.

## At a glance

```sql
-- Multi-pattern join with a FILTER and a solution modifier.
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n
     WHERE { ?s foaf:name ?n .
             ?s <http://example.com/age> ?age
             FILTER(?age >= 30) }
   ORDER BY ?n LIMIT 50');
```

[**Next — BGP joins →**](/v0.4/query/bgp-joins)
