---
title: Roadmap
description: The pgRDF roadmap — the v0.6.x line delivered the staged bulk loader benchmark and post-benchmark threading (T1–T6, shipped in v0.6.14); v0.7 is gated on graph carving and per-graph index reorganization, shipping as further v0.6.n micro-releases (C1–C6) toward the v0.7.0 graduation.
---

# <span class="material-symbols-outlined icon-orange">rocket_launch</span>Roadmap

> The 0.6.x line ships as **attested micro-releases**. Each cut is
> CI-built and signed with SLSA Build Provenance v1. v0.7.0 is the
> graduation at the end of the carving work — not a parallel branch.

## <span class="material-symbols-outlined icon-green">check_circle</span>Delivered — the v0.6.x bulk-ingest line

The v0.6.x line landed the [staged bulk loader](/v0.6/storage/staged-loader)
benchmark and the post-benchmark threading work that made the
[8.2-billion-triple load](/v0.6/scale/) fast. Tasks **T1–T6 shipped in
v0.6.14**:

| Task | Shipped | What it delivered |
|---|---|---|
| **T1–T6** | **v0.6.14** | Post-benchmark threading — parallel STAGE COPY, concurrent index build, adaptive self-tune, and the resolve-strategy selector. **37 % faster** than the v0.6.13 hash baseline (4 h 53 m / 466 K tps vs. 6 h 41 m / 340.7 K). See [Scale & benchmarks](/v0.6/scale/). |

## <span class="material-symbols-outlined icon-orange">rocket_launch</span>Toward v0.7 — graph carving (C1–C6)

**v0.7 is gated on graph carving and per-graph index
reorganization.** This work ships as further **v0.6.n
micro-releases**, each a clean increment, culminating in the v0.7.0
graduation:

| Step | Release | What it delivers |
|---|---|---|
| **C1 — Carve by query** | v0.6.15 | Cut a query-defined slice out of the full source graph — the [`Carve(query)` verb](/v0.6/process/). |
| **C2 — Re-encode** | v0.6.16 | Re-encode the carved slice into a fresh, small dictionary so the working set shrinks to the slice. |
| **C3 — Full hexastore + string index** | v0.6.17 | Full 6-way bidirectional hexastore plus a `pg_trgm` string index on the carved graph. |
| **C4 — Park-graph lifecycle** | v0.6.18 | seal / unseal / unload — the park-graph lifecycle behind the [`Unload` verb](/v0.6/process/). |
| **C5 — Right-sizing** | v0.6.19 | Right-size to the operator's hardware automatically — no `postgresql.conf` tuning required. |
| **C6 — At-scale validation** | **v0.7.0** | At-scale validation of the carved-reasoning pipeline → the **v0.7.0 graduation**. |

These steps build the [scale-meets-hardware chain](/v0.6/process/)
end to end: ingest the full graph in parallel (shipped), carve a
right-sized slice (C1/C2), index it (C3), park the rest (C4),
right-size to the box (C5), and validate the whole flow at scale (C6).

## <span class="material-symbols-outlined icon-orange">schedule</span>Per-pillar forward edges (the v0.6-FUTURE backlog)

Each pillar carries its own forward edge from the `v0.6-FUTURE` spec —
performance and depth work, not missing pillar surface:

| Pillar | Forward-edge items |
|---|---|
| **[Storage](/v0.6/storage/)** | Big-RAM bulk-ingest tuning and the staged-loader strategy work (folded into the C1–C6 line above). |
| **[SPARQL query](/v0.6/query/roadmap)** | `executor.rs` core-BGP carve · native SHACL-SPARQL engine (gate E-012) · federated `SERVICE` · incremental materialisation · RDF 1.2 triple terms (gate E-011). |
| **[Inference](/v0.6/inference/)** | Reasoning over a carved, right-sized slice — single-threaded by design; the carving line (C1–C6) is what makes at-scale reasoning practical. |
| **[Validation](/v0.6/validation/)** | SHACL-SPARQL constraint execution (gate E-012). |

## <span class="material-symbols-outlined icon-orange">schedule</span>Documented upstream gates (not pgRDF defects)

Two backlog items are blocked on a third-party crate shipping the
required surface. They are honest, documented dependencies — the
pgRDF side is built; the upstream side is the gate:

| Erratum | What | Upstream gate |
|---|---|---|
| **E-011** | RDF 1.2 triple terms **and** the crates.io publish | Both wait on [`gtfierro/reasonable#50`](https://github.com/gtfierro/reasonable/issues/50). The crates.io publish is deliberately held until that lands — the tarball / OCI bundle are the consumption path meanwhile. |
| **E-012** | SHACL-SPARQL constraint execution (`sh:sparql` / `sh:select` / `sh:ask`) | Waits on [`rudof`](https://github.com/rudof-project/rudof) (#21 / #94). The `pgrdf.validate(…, mode => 'sparql')` surface is shipped and honest — it reports what it can and is clear about what the upstream engine doesn't yet execute. See [SHACL-SPARQL](/v0.6/validation/). |

The full upstream-gate detail lives on the
[SPARQL forward edge](/v0.6/query/roadmap).

## See also

<div class="icon-bullets">

- <span class="material-symbols-outlined">query_stats</span> [**Scale & benchmarks**](/v0.6/scale/) — what the delivered v0.6.x line achieved.
- <span class="material-symbols-outlined">account_tree</span> [**Processes & flows**](/v0.6/process/) — the carve / unload verbs C1–C6 are building toward.
- <span class="material-symbols-outlined">bolt</span> [**Native staged bulk loader**](/v0.6/storage/staged-loader) — the engine the C1–C6 carving line extends.

</div>
