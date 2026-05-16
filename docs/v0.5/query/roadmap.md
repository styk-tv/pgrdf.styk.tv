---
title: Forward edge — what's next
description: The complete v0.5.0 SPARQL surface, the v0.6-FUTURE backlog, and the two documented upstream gates (E-011 / E-012) that are not pgRDF defects.
---

# <span class="material-symbols-outlined icon-orange">rocket_launch</span>Forward edge — what's next

> **v0.5.0 is final.** The entire SPARQL surface — read, write,
> CONSTRUCT, DESCRIBE, property paths, named graphs — is shipped
> and on a tagged, **Latest** release. This page records what
> landed and the post-v0.5 backlog. Tracked in
> [`SPEC.pgRDF.LLD.v0.4`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
> and
> [`SPEC.pgRDF.LLD.v0.5-FUTURE`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).

## <span class="material-symbols-outlined icon-green">check_circle</span>Shipped (tagged releases)

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase B** — v0.4.2 — [Graph lifecycle UDFs](/v0.5/storage/lifecycle): `drop_graph`, `clear_graph`, `copy_graph`, `move_graph`.
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase C** — v0.4.3 — [Full SPARQL UPDATE surface](/v0.5/query/update): INSERT/DELETE DATA, pattern-driven INSERT/DELETE WHERE, atomic DELETE+INSERT/WHERE, WITH + inline GRAPH scoping, DROP/CLEAR/CREATE lifecycle algebra.
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase D** — v0.4.4 — [CONSTRUCT](/v0.5/query/construct): constant-only + variable + blank-node + multi-triple templates, GRAPH-scoped WHERE, WHERE-shorthand, round-trip ingest, `sparql_parse` shape analysis.
- <span class="material-symbols-outlined icon-green">check_circle</span>**Phase E** — v0.4.5 — [Property paths](/v0.5/query/property-paths): `^` `+` `*` `?` `|` with cycle-safe recursive CTEs, the `pgrdf.path_max_depth` guard, W3C §9.3 zero-length semantics, and the materialised-closure no-CTE fast path.
- <span class="material-symbols-outlined icon-green">check_circle</span>**v0.5.0 (final)** — the residual surface that closed the cut: `DESCRIBE` ([W3C §16.4 CBD](/v0.5/query/) via `pgrdf.describe`), `VALUES` inline bindings, downstream `BIND` (after the BGP block), aggregates over `UNION`, type-aware `ORDER BY`, multi-triple `OPTIONAL`, `TriG` + `N-Quads` ingest (`pgrdf.parse_trig` / `pgrdf.parse_nquads`), BIGINT **and** IRI overloads on every lifecycle UDF (`drop_graph` / `clear_graph` / `copy_graph` / `move_graph`), the [`pgrdf.materialize(g, profile)` selector](/v0.5/inference/profile-selector) (`'owl-rl'` + `'rdfs'`), and genuine [W3C SHACL Core 25/25](/v0.5/validation/) plus the wired W3C SHACL manifest runner.

</div>

That closes the LLD v0.4 §4 / §5 / §6 / §7 columns and the
v0.5.0 residual list. The SPARQL read **and** write surface,
named graphs, lifecycle, CONSTRUCT, DESCRIBE, VALUES, and
property paths are all on the tagged, **Latest** v0.5.0 release.

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Still ahead — the v0.6-FUTURE backlog

v0.5.0 is feature-complete for its scope. The post-v0.5 backlog
in the [`v0.5-FUTURE` spec](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md)
is performance and depth work, not missing pillar surface:

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**`executor.rs` core-BGP carve** — restructure the BGP translator core for clarity and reuse.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**`heap_multi_insert` phase B** — the direct-heap ingest fast path beyond the current prepared-statement pipeline.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**A native SHACL-SPARQL engine** — see the upstream gate below.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**Federated `SERVICE`** — query across remote SPARQL endpoints.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**Incremental materialisation** — re-materialise only the affected closure on graph delta.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**RDF 1.2 triple terms** — see the upstream gate below.

</div>

## <span class="material-symbols-outlined icon-orange">schedule</span>Documented upstream gates (not pgRDF defects)

Two items are blocked on a third-party crate shipping the
required surface. They are honest, documented dependencies — the
pgRDF side is built; the upstream side is the gate:

| Erratum | What | Upstream gate |
|---|---|---|
| **E-011** | RDF 1.2 triple terms **and** the crates.io publish | Both wait on [`gtfierro/reasonable#50`](https://github.com/gtfierro/reasonable/issues/50). The crates.io publish is deliberately held until that lands — the tarball / OCI bundle are the consumption path meanwhile. |
| **E-012** | SHACL-SPARQL constraint execution (`sh:sparql` / `sh:select` / `sh:ask`) | Waits on [`rudof`](https://github.com/rudof-project/rudof) (#21 / #94). The `pgrdf.validate(…, mode => 'sparql')` **surface is shipped and honest** — it reports what it can and is clear about what the upstream engine doesn't yet execute. See [SHACL-SPARQL](/v0.5/validation/shacl-sparql). |

## Spec-permitted gaps (by design, not "coming soon")

These are explicitly out of scope per the LLD — pgRDF rejects
them with a stable prefix rather than silently mis-answering:

- **Negated property sets** `?s !(p) ?o` — panics with a stable
  prefix.
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
