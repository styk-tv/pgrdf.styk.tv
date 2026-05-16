---
title: Introduction
description: pgRDF — PostgreSQL extension for RDF, SPARQL, SHACL and OWL 2 RL reasoning. The four engines, who it's for, how it differs from a separate triplestore. The complete v0.5.0 capability surface.
---

# Introduction

<div class="glance-grid">
<div class="glance-text">

::: info At a glance
**pgRDF** · Semantic web inside PostgreSQL ·
Status **Alpha** · License **Apache-2.0** ·
Postgres **14 · 15 · 16 · 17** ·
Latest release [**v0.5.0**](https://github.com/styk-tv/pgRDF/releases) (final) — the complete four-pillar surface: SPARQL SELECT/ASK/[CONSTRUCT](/v0.5/query/construct)/DESCRIBE + [property paths](/v0.5/query/property-paths) + full UPDATE, OWL 2 RL **and** RDFS [materialization](/v0.5/inference/), genuine [SHACL Core](/v0.5/validation/) 25/25 ·
[GitHub releases](https://github.com/styk-tv/pgRDF/releases) ·
anonymous [OCI bundle](/v0.5/operations/install) ·
[GitHub](https://github.com/styk-tv/pgRDF) ·
[Install →](/v0.5/operations/install)
:::

</div>
<div class="glance-logo">

[![pgRDF logo](/pgRDF-logo.v0.5.960.png)](/pgRDF-logo.v0.5.png)

</div>
</div>

**pgRDF** is a PostgreSQL extension that turns your Postgres
database into a high-performance semantic-web platform. Written
in Rust on top of [`pgrx`](https://github.com/pgcentralfoundation/pgrx),
it provides four real engines under one extension surface:

| Engine | What it does | Entry-point UDFs |
|---|---|---|
| **Storage** | Dictionary-encoded triples in LIST-partitioned tables with SPO / POS / OSP covering indexes. Turtle, TriG, and N-Quads ingest. | [`pgrdf.load_turtle`](/v0.5/storage/load-turtle), [`pgrdf.parse_turtle`](/v0.5/storage/parse-turtle), [`pgrdf.parse_trig`](/v0.5/storage/parse-turtle), [`pgrdf.parse_nquads`](/v0.5/storage/parse-turtle), [`pgrdf.add_graph`](/v0.5/storage/named-graphs) |
| **SPARQL** | SPARQL 1.1 SELECT / ASK / CONSTRUCT / DESCRIBE + full UPDATE + property paths — parsed via `spargebra`, translated to dynamic SQL, executed with a per-backend plan cache. | [`pgrdf.sparql`](/v0.5/query/), [`pgrdf.construct`](/v0.5/query/construct), [`pgrdf.describe`](/v0.5/query/), [`pgrdf.sparql_parse`](/v0.5/query/sparql-parse) |
| **Inference** | OWL 2 RL **and** RDFS forward-chaining via the [`reasonable`](https://github.com/gtfierro/reasonable) reasoner. Writes inferences back as queryable rows. | [`pgrdf.materialize`](/v0.5/inference/) |
| **Validation** | Native SHACL Core (genuine W3C SHACL Core 25/25) via the [rudof project's](https://github.com/rudof-project/rudof) `shacl` crate. Returns a W3C `sh:ValidationReport`-shape JSONB document. | [`pgrdf.validate`](/v0.5/validation/) |

All four engines run **inside Postgres**. There's no separate
service, no second deployment surface, no extra protocol. Every
operation is addressable from any Postgres client (psql,
psycopg, sqlx, pgx, postgres.js — anything that speaks the
Postgres wire protocol).

```sql
-- One-time install
CREATE EXTENSION pgrdf;

-- Load any Turtle file from the server filesystem
SELECT pgrdf.load_turtle('/fixtures/ontologies/foaf.ttl', 100);
--  → 631

-- Query with SPARQL
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s ?n WHERE { ?s foaf:name ?n }');

-- Materialize OWL 2 RL inferences
SELECT pgrdf.materialize(100);
--  → {"base_triples": 631, "inferred_triples_written": 1842, ...}

-- Validate against SHACL shapes
SELECT pgrdf.validate(100, 200);
--  → {"conforms": true, "results": []}
```

This documentation describes the **final v0.5.0 release** — the
complete, coherent four-pillar capability set. Every feature on
this site is shipped, tagged, and exercised by the test bar
(**274 pgrx + 85 pg_regress + 51 W3C-SPARQL + 25 W3C SHACL Core
+ 3 LUBM**). The remaining backlog is the post-v0.5 work tracked
under **v0.6-FUTURE**; two items are *documented upstream gates*
(not pgRDF defects) — see [the SPARQL forward edge](/v0.5/query/roadmap).

## Why pgRDF, not a separate triplestore?

Knowledge graphs are usually deployed as a **second database**
alongside Postgres — with their own backups, IAM, observability,
SLOs, and operator burden. Application code glues two systems
together over the wire.

pgRDF takes a different view:

| Concern | Separate triplestore | pgRDF |
|---|---|---|
| Where the graph lives | Second process tree | Inside Postgres |
| Connection pool | New | Reuses your existing pool |
| Backup / WAL / PITR | Bespoke | Inherited from Postgres |
| IAM, auth, TLS | Bespoke | Inherited from Postgres |
| Multi-tenancy | Bespoke | LIST partitions per `graph_id` |
| Composition with SQL | Bridge layer | Native — SPARQL is a set-returning SQL function |
| Monitoring | Extra agent | Standard Postgres tooling + `pgrdf.stats()` |
| Install footprint | Cluster, operator, CRD | Three files bind-mounted onto a stock PG image |

You also get the four standard semantic-web operations —
load Turtle, SPARQL query, OWL 2 RL materialize, SHACL
validate — first-class.

## Audience

This site is the user-facing documentation. It assumes you know
SQL and at least the basics of RDF, SPARQL, OWL, and SHACL —
but not all four. Each pillar's documentation can be read
independently.

<div class="icon-bullets">

- <span class="material-symbols-outlined">groups</span> **Project managers** — start with [The four pillars](/v0.5/pillars) to scope what pgRDF can absorb from your backlog.
- <span class="material-symbols-outlined">query_stats</span> **Data scientists** — start with [Storage](/v0.5/storage/) and [SPARQL queries](/v0.5/query/) to see how you'd join graph data against your existing SQL tables.
- <span class="material-symbols-outlined">school</span> **Ontologists** — start with [Inference](/v0.5/inference/) and [Validation](/v0.5/validation/) to see which slice of OWL 2 RL and SHACL Core runs at the storage layer.
- <span class="material-symbols-outlined">code</span> **Backend engineers** — start with [Compose with regular SQL](/v0.5/operations/sql-composition) to see how to call pgRDF from your existing connection pool.
- <span class="material-symbols-outlined">settings</span> **Operators** — start with [Drop-in install](/v0.5/operations/install) and [`pgrdf.stats()`](/v0.5/operations/stats).

</div>

## Where this content comes from

This site translates the canonical feature spec
[`SPEC.pgRDF.v0.5.FEATURES.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.v0.5.FEATURES.md)
into a per-feature documentation surface. Each page here cites
the test fixture in
[`styk-tv/pgRDF/tests/`](https://github.com/styk-tv/pgRDF/tree/main/tests)
that pins the contract — every feature is real and tested, not
aspirational. The whole v0.5.0 surface is callable on `main`
today. The post-v0.5 backlog (RDF 1.2 triple terms, a
heap-multi-insert ingest phase, a native SHACL-SPARQL engine,
federated `SERVICE`, incremental materialisation) is tracked in
[`SPEC.pgRDF.LLD.v0.5-FUTURE.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md);
two of those depend on upstream crates that haven't shipped the
required surface yet — they're *documented upstream gates*, not
missing pgRDF features.

## Get the bits

- **Releases** — <https://github.com/styk-tv/pgRDF/releases> — the v0.5.0 release ships eight per-PG binary tarballs (pg14–17 × amd64/arm64) plus `SHA256SUMS`, and is marked **Latest**.
- **OCI bundle** — `ghcr.io/styk-tv/pgrdf-bundle:v0.5.0` — anonymously pullable, zero credentials: `oras pull ghcr.io/styk-tv/pgrdf-bundle:v0.5.0`.
- **CHANGELOG** — <https://github.com/styk-tv/pgRDF/blob/main/CHANGELOG.md>.
- **Source** — <https://github.com/styk-tv/pgRDF>.
- **crates.io** — <https://crates.io/crates/pgrdf> — namespace placeholder; a crates.io publish is intentionally deferred to v0.6 (it is **not** the consumption path — use the release tarball or the OCI bundle).

See [Drop-in install](/v0.5/operations/install) for the
five-minute path on stock `postgres:17.4` containers via
per-file `:ro` bind mounts (`.so` / `.control` / `.sql`), and
the credential-free OCI pull. The full install spec is
[`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md).

[**Next — the four pillars →**](/v0.5/pillars)
