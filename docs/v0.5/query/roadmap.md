---
title: Forward edge — what's next
description: SPARQL surface still in flight in the pgRDF v0.4 cycle — CONSTRUCT, property paths, and the smaller residual items.
---

# <span class="material-symbols-outlined icon-orange">rocket_launch</span>Forward edge — what's next

> What's landing next on the SPARQL surface. Tracked in
> [`SPEC.pgRDF.LLD.v0.4 §6–§7`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
> and
> [`SPEC.pgRDF.LLD.v0.5-FUTURE.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).

This page is forward-looking. None of the surface described here
is callable on the current `main` cut — everything below is **in
the in-progress cycle** and clearly future-tensed.

For surface that *has* already shipped, see the relevant feature
pages. Recently shipped:

- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase B** (v0.4.2) — [Graph lifecycle UDFs](/v0.5/storage/lifecycle)
  (`drop_graph`, `clear_graph`, `copy_graph`, `move_graph`).
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase C** (v0.4.3) — [Full SPARQL UPDATE surface](/v0.5/query/update)
  (INSERT/DELETE DATA, pattern-driven INSERT/DELETE WHERE,
  atomic DELETE+INSERT/WHERE, WITH and inline GRAPH scoping,
  DROP/CLEAR/CREATE lifecycle algebra).

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Phase D — CONSTRUCT

`CONSTRUCT` is the canonical SPARQL form for **graph-snapshot
export, view materialisation, and graph-rewrite pipelines**:
take a WHERE pattern, instantiate a graph template against every
solution, return the resulting triples.

The v0.4 plan adds a sibling UDF rather than overloading
`pgrdf.sparql`:

```
pgrdf.construct(q TEXT) → SETOF JSONB
```

Each result row has the shape `{subject, predicate, object}`
(JSONB), suitable for direct piping into `INSERT INTO … SELECT`
or any tabular consumer.

Use-cases this unlocks:

- **Snapshot a subgraph as a CONSTRUCT** that you store as a row
  set or feed into another pgRDF graph.
- **Implement a graph view** as a CONSTRUCT query wrapped in a
  Postgres `VIEW`.
- **Pipeline transformations** — CONSTRUCT against an input
  graph, capture the result, INSERT-DATA into an output graph.

Tracked at [`SPEC.pgRDF.LLD.v0.4 §6`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Property paths

The closure-aware path operators:

| Operator | Meaning |
|---|---|
| `p*` | Zero or more `p` hops. |
| `p+` | One or more `p` hops. |
| `p?` | Zero or one `p` hop. |
| `^p` | Inverse path. |
| `p1\|p2` | Alternation (stretch goal). |

These will be **closure-aware**: where the closure was already
[materialized](/v0.5/inference/) into the graph (via OWL 2 RL
forward-chaining over `rdfs:subClassOf` or
`owl:TransitiveProperty`), the translator will pick the
materialised view; otherwise it will fall back to recursive SQL
through Postgres' `WITH RECURSIVE`.

This is the surface that closes the gap between "the inference
engine produced a closure" and "SPARQL queries can walk it
ergonomically" without forcing the application to model the
transitive closure separately.

Tracked at [`SPEC.pgRDF.LLD.v0.4 §7`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## Residual SPARQL items

Smaller items from the v0.3 backlog land alongside the items
above as part of the same delivery group.

| Item | Sketch |
|---|---|
| `VALUES` | Inline bindings as a solution source — `VALUES (?a ?b) { (:x :y) (:p :q) }` |
| `BIND` downstream | `BIND` after the BGP block (currently must precede the consuming pattern). |
| Aggregates over `UNION` | Group + aggregate where the underlying pattern is a UNION. |
| `DESCRIBE` | Return a concise description of one or more resources. |

Tracked at [`SPEC.pgRDF.LLD.v0.4 §11`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## Beyond v0.4 — the v0.5 target

Looking further out, the v0.5-FUTURE spec covers:

- **Reasoning profile selector** on `pgrdf.materialize` —
  per-call choice between RDFS, OWL 2 RL, and an extended
  OWL 2 RL+ rule set. See
  [Profile selector](/v0.5/inference/profile-selector).
- **TriG + N-Quads ingest** — `pgrdf.parse_trig`,
  `pgrdf.parse_nquads` for full named-graph serialisations.
- **SHACL-SPARQL** — custom constraint components defined as
  SPARQL `SELECT` / `ASK` queries. See
  [Forward edge — SHACL-SPARQL](/v0.5/validation/shacl-sparql).
- **W3C SHACL manifest runner** — wired to CI like the SPARQL
  conformance suite is today.
- **IRI overloads for lifecycle UDFs** — `drop_graph(iri TEXT)`,
  `clear_graph(iri TEXT)`, etc. as ergonomic siblings to the
  integer-id variants.

See [`SPEC.pgRDF.LLD.v0.5-FUTURE.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md)
for the full v0.5 scope.
