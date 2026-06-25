---
title: Forward edge — what's next
description: The complete SPARQL surface at v0.6.14, the forward backlog, and the two documented upstream gates (E-011 / E-012) that are not pgRDF defects.
---

# <span class="material-symbols-outlined icon-orange">rocket_launch</span>Forward edge — what's next

> The entire SPARQL surface — read, write, CONSTRUCT, DESCRIBE,
> property paths, named graphs — is shipped on the tagged,
> **Latest** v0.6.14 release. This page records the SPARQL
> pillar's forward edge; for the broader v0.6 plan across every
> pillar see the [**Roadmap**](/v0.6/roadmap/).

## <span class="material-symbols-outlined icon-green">check_circle</span>Shipped (tagged releases)

The SPARQL surface graduated in phases through the v0.4 cut and
has been stable across the v0.5 → v0.6 line:

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-green">check_circle</span>**Graph lifecycle UDFs** — [`drop_graph`, `clear_graph`, `copy_graph`, `move_graph`](/v0.6/storage/lifecycle).
- <span class="material-symbols-outlined icon-green">check_circle</span>**Full SPARQL UPDATE surface** — [INSERT/DELETE DATA, pattern-driven INSERT/DELETE WHERE, atomic DELETE+INSERT/WHERE, WITH + inline GRAPH scoping, DROP/CLEAR/CREATE lifecycle algebra](/v0.6/query/update).
- <span class="material-symbols-outlined icon-green">check_circle</span>**[CONSTRUCT](/v0.6/query/construct)** — constant-only + variable + blank-node + multi-triple templates, GRAPH-scoped WHERE, WHERE-shorthand, round-trip ingest, `sparql_parse` shape analysis.
- <span class="material-symbols-outlined icon-green">check_circle</span>**[Property paths](/v0.6/query/property-paths)** — `^` `+` `*` `?` `|` with cycle-safe recursive CTEs, the `pgrdf.path_max_depth` guard, W3C §9.3 zero-length semantics, and the materialised-closure no-CTE fast path.
- <span class="material-symbols-outlined icon-green">check_circle</span>**The residual read surface** — `DESCRIBE` ([W3C §16.4 CBD](/v0.6/query/) via `pgrdf.describe`), `VALUES` inline bindings, downstream `BIND` (after the BGP block), aggregates over `UNION`, type-aware `ORDER BY`, multi-triple `OPTIONAL`, `TriG` + `N-Quads` ingest (`pgrdf.parse_trig` / `pgrdf.parse_nquads`), BIGINT **and** IRI overloads on every lifecycle UDF (`drop_graph` / `clear_graph` / `copy_graph` / `move_graph`), the [`pgrdf.materialize(g, profile)` selector](/v0.6/inference/) (`'owl-rl'` + `'rdfs'`), and [W3C SHACL Core 25/25](/v0.6/validation/) plus the wired W3C SHACL manifest runner.

</div>

The SPARQL read **and** write surface, named graphs, lifecycle,
CONSTRUCT, DESCRIBE, VALUES, and property paths are all on the
tagged, **Latest** v0.6.14 release. The whole surface is exercised
by the test bar (**294 pgrx + 93 pg_regress + 51 W3C-SPARQL + 25
W3C SHACL Core + 3 LUBM**).

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Still ahead — the forward backlog

The SPARQL pillar is feature-complete for its scope. The forward
backlog in the
[`v0.6-FUTURE` spec](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.6-FUTURE.md)
is performance and depth work, not missing pillar surface:

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**`executor.rs` core-BGP carve** — restructure the BGP translator core for clarity and reuse.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**A native SHACL-SPARQL engine** — see the upstream gate below.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**Federated `SERVICE`** — query across remote SPARQL endpoints.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**Incremental materialisation** — re-materialise only the affected closure on graph delta.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span>**RDF 1.2 triple terms** — see the upstream gate below.

</div>

The bulk-ingest line (the [staged loader](/v0.6/storage/staged-loader)
and big-RAM tuning) is the other major thread of the v0.6 line —
covered in full on the [**Roadmap**](/v0.6/roadmap/) and the
[**Storage**](/v0.6/storage/) pillar.

## <span class="material-symbols-outlined icon-orange">schedule</span>Documented upstream gates (not pgRDF defects)

Two items are blocked on a third-party crate shipping the
required surface. They are documented upstream dependencies — the
pgRDF side is built; the upstream side is the gate:

| Erratum | What | Upstream gate |
|---|---|---|
| **E-011** | RDF 1.2 triple terms **and** the crates.io publish | Both wait on [`gtfierro/reasonable#50`](https://github.com/gtfierro/reasonable/issues/50). The crates.io publish is deliberately held until that lands — the tarball / OCI bundle are the consumption path meanwhile. |
| **E-012** | SHACL-SPARQL constraint execution (`sh:sparql` / `sh:select` / `sh:ask`) | Waits on [`rudof`](https://github.com/rudof-project/rudof) (#21 / #94). The `pgrdf.validate(…, mode => 'sparql')` **surface is shipped** — it reports what it can and is clear about what the upstream engine doesn't yet execute. See [SHACL-SPARQL](/v0.6/validation/). |

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
  the LLD explicitly permits gating them. They preview-panic with
  a stable nested-recursive prefix. [`sparql_parse`](/v0.6/query/sparql-parse)
  does **not** panic — it flags only the gated remainder in
  `unsupported_algebra`.
