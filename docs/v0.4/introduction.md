# Introduction

**pgRDF** is a PostgreSQL extension that turns your Postgres
database into a high-performance semantic-web platform. Written
entirely in Rust on top of [`pgrx`](https://github.com/pgcentralfoundation/pgrx),
it provides four real engines under one extension surface:

| Engine | What it does | Entry-point UDFs |
|---|---|---|
| **Storage** | Dictionary-encoded triples in LIST-partitioned tables with SPO/POS/OSP covering indexes. | `pgrdf.load_turtle`, `pgrdf.parse_turtle`, `pgrdf.add_graph` |
| **SPARQL** | SPARQL 1.1 SELECT/ASK — parsed via `spargebra`, translated to dynamic SQL, executed with a per-backend plan cache. | `pgrdf.sparql`, `pgrdf.sparql_parse` |
| **Inference** | OWL 2 RL forward-chaining via the [`reasonable`](https://github.com/gtfierro/reasonable) reasoner. Writes inferences back as queryable rows. | `pgrdf.materialize` |
| **Validation** | SHACL Core via the [rudof project's](https://github.com/rudof-project/rudof) `shacl` crate. Returns a W3C `sh:ValidationReport`-shape JSONB. | `pgrdf.validate` |

All four engines run **inside Postgres**. There's no separate
service, no second deployment surface, no extra protocol. Every
operation is addressable from any Postgres client (psql, psycopg,
sqlx, pgx, postgres.js — anything that speaks the Postgres wire
protocol).

## Audience

This site is the user-facing documentation. It assumes you know
SQL and at least the basics of RDF, SPARQL, OWL, and SHACL — but
not all four. Each pillar's documentation can be read independently.

- **Project managers** — start with [The four pillars](/v0.4/pillars)
  to scope what pgRDF can absorb from your backlog.
- **Data scientists** — start with [Storage](/v0.4/storage/) and
  [SPARQL queries](/v0.4/query/) to see how you'd join graph data
  against your existing SQL tables.
- **Ontologists** — start with [Inference](/v0.4/inference/) and
  [Validation](/v0.4/validation/) to see which slice of OWL 2 RL
  and SHACL Core runs at the storage layer.

## Where this content comes from

This site translates the canonical feature spec
[`SPEC.pgRDF.v0.5.FEATURES.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.v0.5.FEATURES.md)
into a per-feature documentation surface. Each page here cites
the test fixture in
[`styk-tv/pgRDF/tests/`](https://github.com/styk-tv/pgRDF/tree/main/tests)
that pins the contract — every feature is real and tested, not
aspirational. Where v0.5 work is described, it's clearly marked
`🚀 v0.5` and links to
[`SPEC.pgRDF.LLD.v0.5-FUTURE.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).

## Installation

See [Drop-in install](/v0.4/operations/install) for the
five-minute path on stock `postgres:17.4` containers via per-file
bind mounts. The full install spec lives at
[`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md).

[**Next — the four pillars →**](/v0.4/pillars)
