# <span class="material-symbols-outlined icon-blue">search</span>Pillar 2 — Semantic query (SPARQL 1.1)

`pgrdf.sparql(q TEXT) → SETOF JSONB` parses SPARQL with
[`spargebra`](https://crates.io/crates/spargebra), translates the
algebra to dynamic SQL against the [hexastore quad
tables](/v0.5/storage/hexastore), executes it, and yields one
JSONB row per solution.

Solution variables become JSONB keys; unbound variables come
through as `null`.

`pgrdf.sparql` also dispatches **UPDATE forms** (INSERT, DELETE,
MODIFY, lifecycle algebra) inside the caller's transaction —
the read and write surface share a single UDF entry point.

## Read surface

<div class="icon-bullets">

- <span class="material-symbols-outlined">search</span> [**BGP joins**](/v0.5/query/bgp-joins) — N-pattern joins.
- <span class="material-symbols-outlined">search</span> [**FILTER**](/v0.5/query/filter) — boolean composition + term-type tests.
- <span class="material-symbols-outlined">hub</span> [**OPTIONAL**](/v0.5/query/optional) — left outer join.
- <span class="material-symbols-outlined">hub</span> [**UNION**](/v0.5/query/union) — disjoint pattern alternatives.
- <span class="material-symbols-outlined">hub</span> [**MINUS**](/v0.5/query/minus) — set difference.
- <span class="material-symbols-outlined">query_stats</span> [**Aggregates**](/v0.5/query/aggregates) — `COUNT`, `SUM`, `AVG`, `MIN`/`MAX`, `GROUP_CONCAT`, `SAMPLE`.
- <span class="material-symbols-outlined">query_stats</span> [**HAVING**](/v0.5/query/having) — post-aggregate FILTER.
- <span class="material-symbols-outlined">search</span> [**BIND**](/v0.5/query/bind) — project computed values.
- <span class="material-symbols-outlined">search</span> [**Solution modifiers**](/v0.5/query/modifiers) — `DISTINCT`, `ORDER BY`, `LIMIT`, `OFFSET`.
- <span class="material-symbols-outlined">search</span> [**ASK**](/v0.5/query/ask) — boolean queries.
- <span class="material-symbols-outlined">account_tree</span> [**GRAPH `<iri> { … }`**](/v0.5/query/graph-clause) — named-graph scoping (literal + variable forms).

</div>

## Write surface

<div class="icon-bullets">

- <span class="material-symbols-outlined">code</span> [**SPARQL UPDATE**](/v0.5/query/update) — `INSERT DATA`, `DELETE DATA`, pattern-driven `INSERT/DELETE WHERE`, atomic `DELETE+INSERT/WHERE`, graph-scoped `WITH` and inline `GRAPH`, plus lifecycle `DROP / CLEAR / CREATE GRAPH`.

</div>

## Diagnostics

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> [**`sparql_parse`**](/v0.5/query/sparql-parse) — inspect parsed shape (read + write) without executing.
- <span class="material-symbols-outlined">info</span> [**Error-message contract**](/v0.5/query/error-contract) — stable error prefixes.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span> [**Forward edge — what's next**](/v0.5/query/roadmap) — CONSTRUCT (Phase D), property paths, smaller residual items.

</div>

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

[**Next — BGP joins →**](/v0.5/query/bgp-joins)
