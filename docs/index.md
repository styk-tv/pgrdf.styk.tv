---
title: Introduction
description: pgRDF — PostgreSQL extension for RDF, SPARQL, SHACL and OWL 2 RL reasoning. The four engines, who it's for, how it differs from a separate triplestore. Tracks the v0.5 target.
---

# Introduction

::: info At a glance
**pgRDF** · Semantic web inside PostgreSQL ·
Status **Alpha** · License **Apache-2.0** ·
Postgres **14 · 15 · 16 · 17** ·
Latest release [**v0.4.0**](https://github.com/styk-tv/pgRDF/releases) ·
[crates.io](https://crates.io/crates/pgrdf) ·
[GitHub](https://github.com/styk-tv/pgRDF) ·
[Install →](/v0.5/operations/install)
:::

**pgRDF** is a PostgreSQL extension that turns your Postgres
database into a high-performance semantic-web platform. Written
in Rust on top of [`pgrx`](https://github.com/pgcentralfoundation/pgrx),
it provides four real engines under one extension surface:

| Engine | What it does | Entry-point UDFs |
|---|---|---|
| **Storage** | Dictionary-encoded triples in LIST-partitioned tables with SPO / POS / OSP covering indexes. | [`pgrdf.load_turtle`](/v0.5/storage/load-turtle), [`pgrdf.parse_turtle`](/v0.5/storage/parse-turtle), [`pgrdf.add_graph`](/v0.5/storage/named-graphs) |
| **SPARQL** | SPARQL 1.1 SELECT/ASK — parsed via `spargebra`, translated to dynamic SQL, executed with a per-backend plan cache. | [`pgrdf.sparql`](/v0.5/query/), [`pgrdf.sparql_parse`](/v0.5/query/sparql-parse) |
| **Inference** | OWL 2 RL forward-chaining via the [`reasonable`](https://github.com/gtfierro/reasonable) reasoner. Writes inferences back as queryable rows. | [`pgrdf.materialize`](/v0.5/inference/) |
| **Validation** | SHACL Core via the [rudof project's](https://github.com/rudof-project/rudof) `shacl` crate. Returns a W3C `sh:ValidationReport`-shape JSONB document. | [`pgrdf.validate`](/v0.5/validation/) |

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

This documentation tracks the **v0.5 target** — a coherent
capability set combining the shipped v0.4 surface with the
in-flight forward edges. Items not yet callable on `main` are
marked **🚀 Forward edge** with a link to the relevant LLD
section.

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

- **Project managers** — start with [The four pillars](/v0.5/pillars)
  to scope what pgRDF can absorb from your backlog.
- **Data scientists** — start with [Storage](/v0.5/storage/) and
  [SPARQL queries](/v0.5/query/) to see how you'd join graph data
  against your existing SQL tables.
- **Ontologists** — start with [Inference](/v0.5/inference/) and
  [Validation](/v0.5/validation/) to see which slice of OWL 2 RL
  and SHACL Core runs at the storage layer.
- **Backend engineers** — start with [Compose with regular SQL](/v0.5/operations/sql-composition)
  to see how to call pgRDF from your existing connection pool.
- **Operators** — start with [Drop-in install](/v0.5/operations/install)
  and [`pgrdf.stats()`](/v0.5/operations/stats).

## Where this content comes from

This site translates the canonical feature spec
[`SPEC.pgRDF.v0.5.FEATURES.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.v0.5.FEATURES.md)
into a per-feature documentation surface. Each page here cites
the test fixture in
[`styk-tv/pgRDF/tests/`](https://github.com/styk-tv/pgRDF/tree/main/tests)
that pins the contract — every feature is real and tested, not
aspirational. Where surface is still in flight (not yet callable
on `main`), it's clearly marked **🚀 Forward edge** with a link
to the relevant LLD section:
[`SPEC.pgRDF.LLD.v0.4.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md)
for in-flight items and
[`SPEC.pgRDF.LLD.v0.5-FUTURE.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md)
for the next-cut target.

## Get the bits

- **Releases** — <https://github.com/styk-tv/pgRDF/releases> — per-PG binary tarballs.
- **CHANGELOG** — <https://github.com/styk-tv/pgRDF/blob/main/CHANGELOG.md>.
- **Source** — <https://github.com/styk-tv/pgRDF>.
- **crates.io** — <https://crates.io/crates/pgrdf>.

See [Drop-in install](/v0.5/operations/install) for the
five-minute path on stock `postgres:17.4` containers via
per-file bind mounts. The full install spec is
[`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md).

[**Next — the four pillars →**](/v0.5/pillars)
