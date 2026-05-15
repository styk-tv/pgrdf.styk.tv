---
layout: home
title: pgRDF — Semantic web inside PostgreSQL
description: Rust-native PostgreSQL extension for RDF, SPARQL, SHACL and OWL 2 RL reasoning. Load Turtle, query SPARQL, validate SHACL, materialize OWL 2 RL inferences — all inside Postgres.

hero:
  name: pgRDF
  text: Semantic web inside PostgreSQL.
  tagline: Load Turtle. Query SPARQL. Validate SHACL. Materialize OWL 2 RL inferences. All in one Postgres extension. Written in Rust.
  image:
    src: /logo.svg
    alt: pgRDF logo
  actions:
    - theme: brand
      text: Get started — v0.5
      link: /v0.5/introduction
    - theme: alt
      text: The four pillars
      link: /v0.5/pillars
    - theme: alt
      text: View on GitHub
      link: https://github.com/styk-tv/pgRDF
    - theme: alt
      text: crates.io
      link: https://crates.io/crates/pgrdf

features:
  - icon: 📦
    title: Pillar 1 — Semantic storage
    details: Turtle in. Quads out. Dictionary-encoded, hexastore-indexed (SPO/POS/OSP), LIST-partitioned per graph. Drop-in install on stock postgres:17.4.
    link: /v0.5/storage/
    linkText: Storage features →
  - icon: 🔍
    title: Pillar 2 — Semantic query
    details: SPARQL 1.1 SELECT/ASK with N-pattern BGP joins, FILTER, OPTIONAL, UNION, MINUS, aggregates, BIND, GRAPH — translated to native SQL with a prepared-plan cache.
    link: /v0.5/query/
    linkText: SPARQL features →
  - icon: 🧠
    title: Pillar 3 — Materialization
    details: OWL 2 RL forward-chaining. Subclass closures, equivalence, inverse, transitive — written back to the same tables as queryable rows. Idempotent.
    link: /v0.5/inference/
    linkText: Inference features →
  - icon: ✅
    title: Pillar 4 — Validation
    details: SHACL Core. A data graph + a shapes graph yields a W3C-shape ValidationReport JSONB. Persist, alert on, or gate ingestion with it.
    link: /v0.5/validation/
    linkText: Validation features →
---

## What is pgRDF?

**pgRDF** turns your PostgreSQL database into a high-performance
semantic-web platform. It's a single extension that adds four
real engines under the `pgrdf.*` schema, written entirely in
Rust on top of [`pgrx`](https://github.com/pgcentralfoundation/pgrx):

1. **A storage engine** — dictionary-encoded triples in
   LIST-partitioned tables with SPO/POS/OSP covering indexes.
2. **A SPARQL 1.1 query engine** — parses with `spargebra`,
   translates the algebra to dynamic SQL, executes with a
   per-backend plan cache.
3. **An OWL 2 RL inference engine** — forward-chaining via
   [`reasonable`](https://github.com/gtfierro/reasonable).
   Inferred quads are written back as `is_inferred = TRUE` rows.
4. **A SHACL Core validation engine** — via the
   [rudof project's](https://github.com/rudof-project/rudof)
   `shacl` crate. Returns a W3C `sh:ValidationReport`-shape
   JSONB document.

Every operation is addressable from any Postgres client — psql,
psycopg, sqlx, pgx, postgres.js, anything that speaks the
Postgres wire protocol. **No separate triplestore. No second
deployment surface. One Postgres.**

```sql
-- One-time install
CREATE EXTENSION pgrdf;

-- Load any Turtle file from the server filesystem
SELECT pgrdf.load_turtle('/fixtures/ontologies/foaf.ttl', 100);
--  → 631

-- Query it with SPARQL
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

## Why does it exist?

Knowledge graphs are usually deployed as a **second database** —
a triplestore alongside your operational Postgres, with separate
backups, separate access control, separate observability, separate
SLOs, separate everything. Application code ends up gluing two
systems together over the wire.

pgRDF treats Postgres as the **storage and execution engine for
the knowledge graph too**. The graph is stored in regular
Postgres tables (partitioned for cheap whole-graph drops,
indexed for hexastore-style triple-pattern lookups). SPARQL
compiles to SQL and runs through Postgres' own planner.
Inference and validation are SQL UDFs.

You get:

- **One operational surface** — the same connection pool,
  ORM, backup tool, monitoring agent, IAM, encryption, and
  failover that already manages your relational data.
- **Native composition with regular SQL** — `pgrdf.sparql(...)`
  is a set-returning function. Join its output against your
  application tables; wrap it in a Postgres view; fold it into
  an `INSERT INTO ... SELECT`. The graph is just another table.
- **Multi-tenancy via partitions** — each `graph_id` is a
  Postgres LIST partition. Drop a tenant's graph by detaching
  one partition. No row-by-row delete.
- **Zero-cost migrations** — no Kubernetes operator, no second
  process tree, no extra cert rotation. Three artefacts
  (`pgrdf.so`, `pgrdf.control`, `pgrdf--<ver>.sql`) bind-mount
  onto a stock `postgres:17.4` image.

## Who is this for?

| You | Why pgRDF helps |
|---|---|
| **Project managers** scoping graph workloads | One operational system. The four pillars (storage / query / inference / validation) cover the canonical SPARQL+OWL+SHACL stack. |
| **Data scientists** doing graph-shaped analytics | SPARQL inside SQL. Join graph features against your relational features in the same query. JSONB rows, no special drivers. |
| **Ontologists** publishing OWL/SHACL artefacts | Real OWL 2 RL forward-chaining; real SHACL Core validation; Turtle ingest that preserves the full term-type space (datatypes, lang tags, blank nodes, RDF lists). |
| **Backend engineers** building knowledge-graph features | A regular Postgres extension. No new connection pool, no new auth surface, no new deployment story. |
| **Operators** running production Postgres | A handful of `pgrdf.*` UDFs. Stable JSONB shape for `pgrdf.stats()`. Drop-in install. Multi-PG (14-17) support. |

## Latest release

The pgRDF project ships per-PG binary tarballs on GitHub
releases. The current shipping cycle is **v0.4**; this
documentation tracks the **v0.5** target (a superset).

- **Releases** — <https://github.com/styk-tv/pgRDF/releases>
- **CHANGELOG** — <https://github.com/styk-tv/pgRDF/blob/main/CHANGELOG.md>
- **crates.io** — <https://crates.io/crates/pgrdf>
- **Install spec** — [`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md)
- **Feature catalogue (canonical)** — [`SPEC.pgRDF.v0.5.FEATURES.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.v0.5.FEATURES.md)

::: tip Five-minute install
```bash
just build-ext     # build pgrdf.{so,control,sql} in a Linux container
just compose-up    # podman / docker compose up -d
just psql          # opens a psql shell
```
Then inside `psql`: `CREATE EXTENSION pgrdf;` — see
[**Drop-in install**](/v0.5/operations/install).
:::

## What's documented here

This site is the user-facing companion to the canonical pgRDF
feature spec
[`SPEC.pgRDF.v0.5.FEATURES.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.v0.5.FEATURES.md).
Each page documents one feature with a description, a working
SQL example, an *under-the-hood* explanation, and links to the
load-bearing test fixtures in
[`styk-tv/pgRDF/tests/`](https://github.com/styk-tv/pgRDF/tree/main/tests).

- **[Introduction](/v0.5/introduction)** — what pgRDF is, the
  four engines, who it's for.
- **[The four pillars](/v0.5/pillars)** — one-stop tour of the
  capability surface, with a composition diagram.
- **[Pillar 1 — Storage](/v0.5/storage/)** — Turtle ingest,
  dictionary, partitions, named graphs, hexastore.
- **[Pillar 2 — SPARQL](/v0.5/query/)** — every SPARQL 1.1
  feature pgRDF exposes, plus the v0.5 roadmap.
- **[Pillar 3 — Inference](/v0.5/inference/)** — OWL 2 RL
  materialization.
- **[Pillar 4 — Validation](/v0.5/validation/)** — SHACL Core.
- **[Operations](/v0.5/operations/)** — observability, caching,
  SQL composition, install.

Items still in flight (not yet callable on the `main` branch
of the pgRDF repo) are clearly marked **🚀 Forward edge** so
you can tell the shipped surface from the planned surface at
a glance.

[**Start with the introduction →**](/v0.5/introduction)
