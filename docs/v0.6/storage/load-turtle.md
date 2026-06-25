---
title: Load Turtle from disk
description: pgrdf.load_turtle reads a Turtle or N-Triples file off the server filesystem, parses it, dictionary-encodes every term, and inserts the quads — auto-selecting the staged loader for N-Triples on a preloaded server.
---

# Load Turtle from disk

> One UDF reads a `.ttl` / `.nt` file off the server filesystem, parses
> it, dictionary-encodes every term, and inserts the resulting quads
> in batches. On a preloaded server it auto-selects the native staged
> loader for large N-Triples files.

## What it does

`pgrdf.load_turtle(path TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL, bulk_load BOOLEAN DEFAULT FALSE) → BIGINT`

Reads the file at `path` (on the **Postgres server's** filesystem,
not the client's), parses it, normalises every term through the
dictionary, and inserts the quads into the partition for `graph_id`.
Returns the count of triples loaded.

The optional **base IRI** resolves relative IRIs in the source
document. Pass `NULL` (the default) when the file has no relative IRIs
or sets its own `@base`.

The optional trailing **`bulk_load`** flag opts into the parallel bulk
loader on a fresh load — see [Bulk ingest](/v0.6/storage/bulk-ingest).

## Format-aware dispatch (new in v0.6)

On a server where pgRDF is in `shared_preload_libraries`,
`load_turtle` **automatically selects the native
[staged loader](/v0.6/storage/staged-loader)** when all of the
following hold:

1. pgRDF is preloaded, **and**
2. the input file sniffs as **N-Triples** (a conservative classifier
   reads the head of the file), **and**
3. no `base_iri` is supplied.

This is the materially faster path on large files. A **Turtle file
always uses the full parser** — the staged path parses N-Triples only,
so a Turtle document is never routed to it and there is no silent
line-skipping or data loss. When the input is Turtle on a preloaded
server, a `NOTICE` recommends N-Triples + preload to unlock the staged
path. On a server without the preload, `load_turtle` always uses the
in-process parser.

## Why you'd use it

- **Project managers** — stop scoping custom ETL for RDF. The entire
  FOAF / PROV-O / DCAT / SOSA / SHACL / OWL ontology set parses with
  one SQL statement; a billion-scale N-Triples dump loads through the
  same front door.
- **Data scientists** — load production graphs into a real PostgreSQL
  instance without leaving SQL.
- **Ontologists** — ingest the canonical Turtle releases of any W3C
  ontology without per-vocabulary tooling.

## Example

```sql
-- Allocate a partition for graph 100.
SELECT pgrdf.add_graph(100);

-- Load FOAF (Turtle) — full parser, returns the triple count.
SELECT pgrdf.load_turtle('/fixtures/ontologies/foaf.ttl', 100);
--  → 631

-- Load with an explicit base IRI for relative-IRI resolution.
SELECT pgrdf.load_turtle(
  '/fixtures/ontologies/prov.ttl', 200,
  'http://www.w3.org/ns/prov#');
--  → 1789

-- On a preloaded server, a large .nt file auto-routes to the
-- staged loader (no base_iri, sniffs as N-Triples).
SELECT pgrdf.load_turtle('/data/wikidata-truthy.nt', 300);
```

For fast end-to-end profiling of an ingest run, use
[`pgrdf.load_turtle_verbose`](/v0.6/storage/verbose-stats) — same
loader, JSONB report instead of an integer.

## How it works

The in-process loader streams Turtle through
[`oxttl`](https://crates.io/crates/oxttl), interns terms via the
[shared-memory dictionary cache](/v0.6/storage/shmem-cache), and
flushes quads in batches using a prepared `INSERT` statement
([bulk ingest](/v0.6/storage/bulk-ingest)). For large N-Triples loads,
the staged path takes over — a native, multi-backend, commit-per-phase
pipeline ([staged loader](/v0.6/storage/staged-loader)). The full
pipeline is described in
[`docs/02-storage.md`](https://github.com/styk-tv/pgRDF/blob/main/docs/02-storage.md).

## Tests

- [`tests/regression/sql/20-load-turtle.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/20-load-turtle.sql)
  — happy-path ingest contract.
- [`tests/regression/sql/81-error-paths.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/81-error-paths.sql)
  — locks the `load_turtle: failed to open` error prefix.
- [`tests/perf/smoke-ontologies.sh`](https://github.com/styk-tv/pgRDF/blob/main/tests/perf/smoke-ontologies.sh)
  — 24 well-known ontologies → 17,134 triples, locked counts in
  [`smoke-ontologies.expected.tsv`](https://github.com/styk-tv/pgRDF/blob/main/tests/perf/smoke-ontologies.expected.tsv).

## See also

- [Native staged bulk loader](/v0.6/storage/staged-loader) — the path
  `load_turtle` auto-selects for large N-Triples files.
- [Bulk ingest](/v0.6/storage/bulk-ingest) — the full loader family.
- [Inline Turtle ingest](/v0.6/storage/parse-turtle) — for fixture
  data and orchestrated loads where the source is a string, not a file.
- [Verbose ingest statistics](/v0.6/storage/verbose-stats).
