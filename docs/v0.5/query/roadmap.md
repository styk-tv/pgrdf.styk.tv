---
title: Forward edge — what's next
description: What's shipped on the SPARQL surface (Phases B–E) and what's still pre-v1.0 — the v0.5-FUTURE items plus the gated path remainder.
---

# <span class="material-symbols-outlined icon-orange">rocket_launch</span>Forward edge — what's next

> The four highest-leverage gaps from the v0.3 cut have all
> shipped. This page records what landed and what's still ahead.
> Tracked in
> [`SPEC.pgRDF.LLD.v0.4`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
> and
> [`SPEC.pgRDF.LLD.v0.5-FUTURE`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).

## <span class="material-symbols-outlined icon-green">check_circle</span>Shipped (tagged releases)

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase B** — v0.4.2 — [Graph lifecycle UDFs](/v0.5/storage/lifecycle): `drop_graph`, `clear_graph`, `copy_graph`, `move_graph`.
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase C** — v0.4.3 — [Full SPARQL UPDATE surface](/v0.5/query/update): INSERT/DELETE DATA, pattern-driven INSERT/DELETE WHERE, atomic DELETE+INSERT/WHERE, WITH + inline GRAPH scoping, DROP/CLEAR/CREATE lifecycle algebra.
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase D** — v0.4.4 — [CONSTRUCT](/v0.5/query/construct): constant-only + variable + blank-node + multi-triple templates, GRAPH-scoped WHERE, WHERE-shorthand, round-trip ingest, `sparql_parse` shape analysis.
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase E** — v0.4.5 — [Property paths](/v0.5/query/property-paths): `^` `+` `*` `?` `|` with cycle-safe recursive CTEs, the `pgrdf.path_max_depth` guard, W3C §9.3 zero-length semantics, and the materialised-closure no-CTE fast path.

</div>

That closes the LLD v0.4 §4 / §5 / §6 / §7 columns. The SPARQL
read **and** write surface, named graphs, lifecycle, CONSTRUCT,
and property paths are all on tagged releases.

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Still ahead — the v0.5 target

The [`v0.5-FUTURE` spec](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md)
covers the residual surface:

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**Reasoning profile selector** on `pgrdf.materialize` — per-call choice between RDFS, OWL 2 RL, and an extended OWL 2 RL+ rule set. See [Profile selector](/v0.5/inference/profile-selector).
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**TriG + N-Quads ingest** — `pgrdf.parse_trig`, `pgrdf.parse_nquads` for full named-graph serialisations.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**SHACL-SPARQL** — custom constraint components defined as embedded SPARQL `SELECT` / `ASK`. See [Forward edge — SHACL-SPARQL](/v0.5/validation/shacl-sparql).
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**W3C SHACL manifest runner** — wired to CI like the SPARQL conformance suite is today.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**IRI overloads for lifecycle UDFs** — `drop_graph(iri TEXT)`, `clear_graph(iri TEXT)`, etc. as ergonomic siblings to the integer-id variants.

</div>

## Residual SPARQL items

Smaller items still queued in the SPARQL surface:

| Item | Sketch |
|---|---|
| `VALUES` | Inline bindings as a solution source — `VALUES (?a ?b) { (:x :y) (:p :q) }` |
| `BIND` downstream | `BIND` after the BGP block (currently must precede the consuming pattern). |
| Aggregates over `UNION` | Group + aggregate where the underlying pattern is a UNION. |
| `DESCRIBE` | Return a concise description of one or more resources. |

Tracked at [`SPEC.pgRDF.LLD.v0.4 §11`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## Deliberately out of scope (v0.4)

Not "coming soon" — these are spec-permitted gaps:

- **Negated property sets** `?s !(p) ?o` — out of v0.4 scope;
  panics with a stable prefix.
- **Explicit sequence path-expressions** `?s p1/p2 ?o` — use the
  equivalent multi-pattern BGP `{ ?s p1 ?m . ?m p2 ?o }`; the
  explicit `Sequence` path-expr is rejected with a pointer to the
  BGP form.
- **The gated path remainder** — an alternation arm that is itself
  a sequence/recursive path (`(a/b|c)`, `(a+|b)`), or a recursive
  operator whose inner box is a sequence (`(p1/p2)+`). Folding
  these would compose a recursive CTE inside an alternation arm;
  LLD §7.1 explicitly permits gating them. They preview-panic with
  a stable nested-recursive prefix. [`sparql_parse`](/v0.5/query/sparql-parse)
  does **not** panic — it flags only the gated remainder in
  `unsupported_algebra`.
