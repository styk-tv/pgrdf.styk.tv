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
- <span class="material-symbols-outlined">search</span> [**Solution modifiers**](/v0.5/query/modifiers) — `DISTINCT`, type-aware `ORDER BY`, `LIMIT`, `OFFSET`.
- <span class="material-symbols-outlined">search</span> [**VALUES**](/v0.5/query/bind) — inline bindings as a solution source.
- <span class="material-symbols-outlined">search</span> [**ASK**](/v0.5/query/ask) — boolean queries.
- <span class="material-symbols-outlined">account_tree</span> [**GRAPH `<iri> { … }`**](/v0.5/query/graph-clause) — named-graph scoping (literal + variable forms).
- <span class="material-symbols-outlined">hub</span> [**Property paths**](/v0.5/query/property-paths) — `^` `+` `*` `?` `\|` with cycle-safe recursion + materialised-closure fast path (v0.4.5).

</div>

## Write surface

<div class="icon-bullets">

- <span class="material-symbols-outlined">code</span> [**SPARQL UPDATE**](/v0.5/query/update) — `INSERT DATA`, `DELETE DATA`, pattern-driven `INSERT/DELETE WHERE`, atomic `DELETE+INSERT/WHERE`, graph-scoped `WITH` and inline `GRAPH`, plus lifecycle `DROP / CLEAR / CREATE GRAPH` (v0.4.3).
- <span class="material-symbols-outlined">code</span> [**CONSTRUCT**](/v0.5/query/construct) — `pgrdf.construct(q) → SETOF JSONB`; templates (constant / variable / blank-node / multi-triple), GRAPH-scoped WHERE, WHERE-shorthand, round-trip ingest (v0.4.4).
- <span class="material-symbols-outlined">code</span> **DESCRIBE** — `pgrdf.describe(q) → SETOF JSONB`; the W3C SPARQL 1.1 §16.4 Concise Bounded Description of one or more resources (v0.5.0).

</div>

## Diagnostics

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> [**`sparql_parse`**](/v0.5/query/sparql-parse) — inspect parsed shape (read + write + paths) without executing.
- <span class="material-symbols-outlined">info</span> [**Error-message contract**](/v0.5/query/error-contract) — stable error prefixes.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span> [**Forward edge — what's next**](/v0.5/query/roadmap) — shipped phases B–E, plus the v0.5 residual surface.

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

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

The SPARQL pillar splits naturally into **three learning loops**.
Take them in order — each loop builds on the previous one:

### Loop 1 — Read fundamentals

<div class="icon-bullets">

- <span class="material-symbols-outlined">search</span> **[BGP joins](/v0.5/query/bgp-joins)** — N triple patterns become an N-way self-join. The core primitive.
- <span class="material-symbols-outlined">search</span> **[FILTER](/v0.5/query/filter)** — once you can write a BGP, filtering it is the next leverage.
- <span class="material-symbols-outlined">search</span> **[Solution modifiers](/v0.5/query/modifiers)** + **[ASK](/v0.5/query/ask)** — DISTINCT, ORDER BY, LIMIT, OFFSET, plus existence checks.

</div>

### Loop 2 — Composition

<div class="icon-bullets">

- <span class="material-symbols-outlined">hub</span> **[OPTIONAL](/v0.5/query/optional)** — left outer join semantics; everything sparse-data needs.
- <span class="material-symbols-outlined">hub</span> **[UNION](/v0.5/query/union)** + **[MINUS](/v0.5/query/minus)** — alternation and set difference.
- <span class="material-symbols-outlined">query_stats</span> **[Aggregates](/v0.5/query/aggregates)** + **[HAVING](/v0.5/query/having)** + **[BIND](/v0.5/query/bind)** — grouping, post-aggregate filtering, computed projections.
- <span class="material-symbols-outlined">account_tree</span> **[GRAPH clause](/v0.5/query/graph-clause)** — named-graph scoping (literal + variable forms, composition with all the above).

</div>

### Loop 3 — Write surface + diagnostics

<div class="icon-bullets">

- <span class="material-symbols-outlined">code</span> **[SPARQL UPDATE](/v0.5/query/update)** — once you can read, the same UDF dispatches the six write forms.
- <span class="material-symbols-outlined">code</span> **[CONSTRUCT](/v0.5/query/construct)** — read-side counterpart to UPDATE's template-from-pattern shape (shipped v0.4.4).
- <span class="material-symbols-outlined">hub</span> **[Property paths](/v0.5/query/property-paths)** — `^` `+` `*` `?` `\|`; the materialised-closure fast path is where inference and query pay each other back (shipped v0.4.5).
- <span class="material-symbols-outlined">info</span> **[sparql_parse](/v0.5/query/sparql-parse)** + **[Error-message contract](/v0.5/query/error-contract)** — programmatic shape inspection and stable error prefixes for tooling.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">school</span> The [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/) and [Update](https://www.w3.org/TR/sparql11-update/) specs.
- <span class="material-symbols-outlined">school</span> Bob DuCharme's [*Learning SPARQL*](https://www.learningsparql.com/) book — the practitioner's reference.
- <span class="material-symbols-outlined">code</span> The [`spargebra`](https://crates.io/crates/spargebra) crate — the algebra layer pgRDF parses against.
- <span class="material-symbols-outlined">mic</span> **Audio companion** — fourteen episodes covering every SPARQL feature on this page (see [Training](/v0.5/training#audio-companion)).

</div>
