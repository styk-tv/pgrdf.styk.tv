# Load Turtle from disk

> One UDF reads a `.ttl` file off the server filesystem, parses it,
> dictionary-encodes every term, and inserts the resulting quads
> in batches.

## What it does

`pgrdf.load_turtle(path TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL) → BIGINT`

Reads the file at `path` (on the **Postgres server's** filesystem,
not the client's), parses it as Turtle, normalises every term
through the dictionary, and inserts the quads into the partition
for `graph_id`. Returns the count of triples loaded.

The third argument is the optional **base IRI** used to resolve
relative IRIs in the source document. Pass `NULL` (the default)
when the file has no relative IRIs or sets its own `@base`.

## Why you'd use it

- **Project managers** — stop scoping custom ETL for RDF. The
  entire FOAF / PROV-O / DCAT / SOSA / SHACL / OWL ontology set
  parses with one SQL statement.
- **Data scientists** — load production graphs into a real
  Postgres instance without leaving SQL.
- **Ontologists** — ingest the canonical Turtle releases of any
  W3C ontology without per-vocabulary tooling.

## Example

```sql
-- Allocate a partition for graph 100.
SELECT pgrdf.add_graph(100);

-- Load FOAF — returns the triple count.
SELECT pgrdf.load_turtle('/fixtures/ontologies/foaf.ttl', 100);
--  → 631

-- Same call, with an explicit base IRI for relative-IRI resolution.
SELECT pgrdf.load_turtle(
  '/fixtures/ontologies/prov.ttl', 200,
  'http://www.w3.org/ns/prov#');
--  → 1789
```

For fast end-to-end profiling of an ingest run, use
[`pgrdf.load_turtle_verbose`](/v0.4/storage/verbose-stats) — same
loader, JSONB report instead of an integer.

## How it works

Under the hood the loader streams Turtle through
[`oxttl`](https://crates.io/crates/oxttl), interns terms via the
[shared-memory dictionary cache](/v0.4/storage/shmem-cache), and
flushes quads in batches using a prepared `INSERT` statement
([bulk ingest](/v0.4/storage/bulk-ingest)). The full pipeline is
described in
[`docs/02-storage.md`](https://github.com/styk-tv/pgRDF/blob/main/docs/02-storage.md)
and
[`SPEC.pgRDF.LLD.v0.4.md §4`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.4.md).

## Tests

- [`tests/regression/sql/20-load-turtle.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/20-load-turtle.sql)
  — happy-path ingest contract.
- [`tests/regression/sql/81-error-paths.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/81-error-paths.sql)
  — locks the `load_turtle: failed to open` error prefix.
- [`tests/perf/smoke-ontologies.sh`](https://github.com/styk-tv/pgRDF/blob/main/tests/perf/smoke-ontologies.sh)
  — 24 well-known ontologies → 17,134 triples, locked counts in
  [`smoke-ontologies.expected.tsv`](https://github.com/styk-tv/pgRDF/blob/main/tests/perf/smoke-ontologies.expected.tsv).

## See also

- [Inline Turtle ingest](/v0.4/storage/parse-turtle) — for fixture
  data and orchestrated loads where the source is a string, not a file.
- [Verbose ingest statistics](/v0.4/storage/verbose-stats).
