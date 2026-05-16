---
title: Property paths — ^ + * ? | with materialised-closure fallback
description: Full SPARQL 1.1 property paths in pgRDF — inverse, one-or-more, zero-or-more, zero-or-one, alternation. Recursive CTEs, cycle-safe, depth-guarded, with a materialised-closure no-CTE fast path.
---

# Property paths

> Full SPARQL 1.1 property paths — `^` `+` `*` `?` `|` — shipped
> in **v0.4.5** (Phase E). They compose for free with named-graph
> scoping, BGP joins, OPTIONAL/UNION/MINUS, CONSTRUCT, and UPDATE
> WHERE bodies, because path support is recognised at the single
> WHERE chokepoint every query form routes through.

## What it does

A property path lets one triple pattern match a *route* through
the graph, not just a single edge. pgRDF supports the operators
that matter in practice:

| Operator | SPARQL | Means |
|---|---|---|
| `^` inverse | `?s ^p ?o` | the `p` edge walked backwards (`?o p ?s`) |
| `+` one-or-more | `?s p+ ?o` | transitive closure — **non-reflexive** |
| `*` zero-or-more | `?s p* ?o` | reflexive transitive closure (includes the node itself) |
| `?` zero-or-one | `?s p? ?o` | the direct edge **or** identity |
| `\|` alternation | `?s (a\|b) ?o` | either predicate — a single non-reflexive step |

Plus every composition the four combine into: `^p+`, `(^p)+`,
`^(p*)`, `(a\|b)+`, `(a\|b)*`, `(a\|b)?`, `^(a\|b)`, `(^a\|^b)`, …

**Out of v0.4 scope:** negated property sets `!(…)` (panics with
a stable prefix). **Use a multi-pattern BGP for sequences** —
`?s p1/p2 ?o` is written `{ ?s p1 ?m . ?m p2 ?o }`; an explicit
`Sequence` path-expression is rejected with a pointer to the BGP
form. A gated remainder (an alternation arm that is itself a
sequence/recursive path, e.g. `(a/b|c)` or `(p1/p2)+`) is
preview-panic by spec allowance — `sparql_parse` reports it in
`unsupported_algebra` rather than panicking.

## Why you'd use it

<div class="icon-bullets">

- <span class="material-symbols-outlined">groups</span> **Project managers** — "everything transitively under this category" / "anyone in this org's reporting chain" become a single pattern, not an application-side graph walk.
- <span class="material-symbols-outlined">query_stats</span> **Data scientists** — ancestor/descendant closures, reachability, and bidirectional traversal in one SPARQL line; the result is JSONB rows you join against your SQL tables.
- <span class="material-symbols-outlined">school</span> **Ontologists** — `rdfs:subClassOf+` / `rdfs:subClassOf*` is *the* canonical class-hierarchy query. With the materialised-closure fast path (below) it's also cheap.
- <span class="material-symbols-outlined">code</span> **Backend engineers** — recursion is pushed into Postgres's `WITH RECURSIVE` with cycle-safety and a configurable depth cap; no recursive application code.
- <span class="material-symbols-outlined">settings</span> **Operators** — the depth guard truncates instead of erroring; `pgrdf.stats().path_depth_truncations` tells you when a cap is being hit.

</div>

## `+` — transitive closure (non-reflexive)

```sparql
PREFIX ex: <http://example.org/>
-- Over a subClassOf-style chain c1 → c2 → … → c11:
SELECT ?x WHERE { ?x ex:sub+ ex:c11 }
--  → c1 … c10   (10 ancestors; a node is NOT its own ancestor)
```

`+` lowers to a `WITH RECURSIVE` CTE exposed as a derived FROM
relation, so it joins to ordinary triple patterns, GRAPH scoping,
and `pgrdf.construct` exactly like a plain triple. **Cycles are
safe** — the CTE uses Postgres's `CYCLE src, dst SET … USING …`
clause (PG 14+), so a cyclic graph terminates after one lap
instead of looping forever.

## `*` and `?` — the W3C §9.3 zero-length semantics

`*` is the **reflexive** closure (`+` plus identity); `?` is the
single direct edge plus identity (no recursion):

```sparql
PREFIX ex: <http://example.org/>
SELECT ?x WHERE { ?x ex:sub* ex:c11 }   -- → c1 … c10 AND c11 itself (reflexive)
SELECT ?o WHERE { ex:c1 ex:sub? ?o }    -- → c1 (identity) AND c2 (direct edge) only
```

The "zero-length" pairs follow the precise W3C SPARQL 1.1 §9.3
rules:

| Pattern | Zero-length contribution |
|---|---|
| `<x> p* ?o` (subject bound) | `{(x,x)}` **unconditionally** — even if `<x>` is in no graph |
| `?s p* <y>` (object bound) | symmetric: `{(y,y)}` unconditionally |
| `<x> p* <y>` (both bound) | true iff `x == y` **or** `x p+ y` |
| `?s p* ?o` (both var) | `{(n,n)}` for every node of the active scope |

A **bound** endpoint's self-pair holds even when the IRI isn't a
term in the data — pgRDF registers the queried IRI as an RDF term
reference (**no quad is added**; the graph is unchanged) so the
opposite variable resolves. An **unbound** endpoint's node-set is
the DISTINCT subject∪object of the active scope; under
`GRAPH <iri>` / `GRAPH ?g` it is scoped to that graph's nodes.

## `|` — alternation (single step)

```sparql
PREFIX ex: <http://example.org/>
SELECT ?c ?who WHERE { ?c (ex:parent|ex:guardian) ?who }
--  parent ∪ guardian edges — one non-reflexive step, no recursion
```

Internally every recursive/optional/alternation builder matches
the predicate as `predicate_id IN (…)`, so a 1-element set is
byte-identical to `= $P` and `|` is just a wider set — the
"union of per-predicate scans" done as one scan. The recursion
compositions `(a|b)+` / `(a|b)*` / `(a|b)?` make the alternation
the recursive step's predicate set.

## Depth guard — `pgrdf.path_max_depth`

A `GucContext::Userset` integer, default **64**, range
**1–1024**. Bounds the recursive walk. A traversal that would go
beyond the cap returns the **truncated** result set — it does
**not** error — and bumps a cross-backend counter:

```sparql
SET pgrdf.path_max_depth = 3;
PREFIX ex: <http://example.org/>
SELECT ?o WHERE { ex:c1 ex:sub+ ?o }     -- → c2,c3,c4 only (truncated)
-- SELECT pgrdf.stats()->>'path_depth_truncations'   → > 0
```

`path_depth_truncations` is zeroed by `pgrdf.shmem_reset()`. It
never under-counts; it may benignly over-count when the cut node
was already reached by a shorter path (permitted by LLD §7.2).

## Materialised-closure no-CTE fast path

When [`pgrdf.materialize(graph_id)`](/v0.5/inference/) has
already entailed the transitive closure of a path's predicate, a
recursive CTE is wasted work — every transitive pair is already a
direct `is_inferred = TRUE` edge. For a `+`/`*` over a **single**
well-known transitive predicate (`rdfs:subClassOf`,
`rdfs:subPropertyOf`, `owl:sameAs`), the translator probes for a
materialised row and, if present, emits a **direct match instead
of the recursive CTE**:

- `+` → the non-reflexive single step
- `*` → that step `UNION` the §9.3 zero-length set

The executed plan carries **no `CTE Scan`** and the result set is
**byte-identical** to the recursive walk — the optimisation is
semantics-preserving. This is the payoff loop between
[inference](/v0.5/inference/) and query: materialise once, then
every `subClassOf+` query is a plain index lookup.

::: tip Debug hook
`pgrdf.sparql_sql(q TEXT) → TEXT` returns the translated SQL
(dictionary ids inlined) — useful to `EXPLAIN`-scrape and confirm
the no-CTE fast path actually fired.
:::

## Composition

Because `GraphPattern::Path` is recognised at the single shared
WHERE chokepoint, paths inherit into **every** query form at
once — SELECT, ASK, [`pgrdf.construct`](/v0.5/query/construct),
and [SPARQL UPDATE](/v0.5/query/update) WHERE bodies. They join
to ordinary BGP patterns, [named-graph scoping](/v0.5/query/graph-clause),
and [OPTIONAL/UNION/MINUS](/v0.5/query/optional) with no
special-casing.

```sparql
PREFIX ex: <http://example.org/>
-- A path inside a GRAPH clause, joined to a plain triple,
-- with an OPTIONAL — all composing freely:
SELECT ?person ?ancestorClass ?label WHERE {
  GRAPH <http://example.org/hr> {
    ?person a ?type .
    ?type rdfs:subClassOf+ ?ancestorClass
  }
  OPTIONAL { ?ancestorClass rdfs:label ?label }
}
```

## Tests

- [`tests/regression/sql/108-property-path-inverse.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/108-property-path-inverse.sql)
- [`tests/regression/sql/109-property-path-plus.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/109-property-path-plus.sql)
- [`tests/regression/sql/110-property-path-star-opt.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/110-property-path-star-opt.sql)
- [`tests/regression/sql/111-property-path-materialised-closure.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/111-property-path-materialised-closure.sql)
- W3C-shape fixtures `36-path-inverse` … `41-path-materialised`.

## See also

- [Inference](/v0.5/inference/) — materialise a closure once, then
  the no-CTE fast path makes `subClassOf+` a plain lookup.
- [GRAPH clause](/v0.5/query/graph-clause) — paths scope to a
  named graph for free.
- [`sparql_parse`](/v0.5/query/sparql-parse) — lowers the full
  executable path set; flags only the gated remainder.
- [Forward edge](/v0.5/query/roadmap) — what's still pre-v1.0.
