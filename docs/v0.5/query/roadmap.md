# 🚀 Forward edge — SPARQL UPDATE / CONSTRUCT / property paths

> What's landing next on the SPARQL surface. Tracked in
> [`SPEC.pgRDF.LLD.v0.4 §4–§7`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
> and
> [`SPEC.pgRDF.LLD.v0.5-FUTURE.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).

This page is forward-looking. None of the surface described here
is callable on the current `main` cut; everything below is **in
the in-progress cycle** and clearly future-tensed.

## SPARQL UPDATE

The mutation forms — `INSERT DATA`, `DELETE DATA`,
`INSERT … WHERE …`, `DELETE … WHERE …`,
`DELETE … INSERT … WHERE …` — will be reachable via the same
`pgrdf.sparql(q)` UDF. The `q` will be inspected for form and
dispatched: SELECT/ASK return rows, UPDATE forms run inside the
caller's transaction and return a JSONB summary
(`{"inserted": N, "deleted": M}`).

Graph-scoped UPDATE variants — `WITH <iri>` and inline
`GRAPH <iri> { … }` — will route to the corresponding partition.

See [`SPEC.pgRDF.LLD.v0.4 §4`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## CONSTRUCT

A sibling UDF `pgrdf.construct(q TEXT) → SETOF JSONB` will return
graph-shape rows of `{subject, predicate, object}` — the canonical
SPARQL form for graph-snapshot export, view materialisation, and
graph-rewrite pipelines.

See [`SPEC.pgRDF.LLD.v0.4 §6`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## Property paths

The closure-aware path operators will land:

| Operator | Meaning |
|---|---|
| `p*` | Zero or more `p` hops. |
| `p+` | One or more `p` hops. |
| `p?` | Zero or one `p` hop. |
| `^p` | Inverse path. |
| `p1\|p2` | Alternation (stretch goal). |

These will be **closure-aware**: where the closure was already
[materialized](/v0.5/inference/) into the graph, the translator will
pick the materialised view; otherwise it will fall back to
recursive SQL.

See [`SPEC.pgRDF.LLD.v0.4 §7`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## VALUES, BIND-downstream, aggregates-over-UNION, DESCRIBE

Smaller residual SPARQL surface items land alongside the items above as part of the same delivery group.
See [`SPEC.pgRDF.LLD.v0.4 §11`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).
