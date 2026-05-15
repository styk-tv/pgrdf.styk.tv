---
title: sparql_parse — inspect without executing
description: pgrdf.sparql_parse(query) returns the parsed algebra shape (form, BGP count, modifiers, UPDATE op detail) as JSONB without executing.
---

# `sparql_parse` — inspect without executing

> Returns the parsed algebra shape as JSONB. Useful for tools,
> linters, routing layers, and validation upstream of `sparql`.

## What it does

`pgrdf.sparql_parse(query TEXT) → JSONB`

Parses a SPARQL query through `spargebra` and returns a JSONB
report of the algebra shape — form (`SELECT` / `ASK` / `UPDATE` /
`CONSTRUCT` / `DESCRIBE`), projection variables, BGP triple
count, modifiers in use, and (for UPDATE) per-op detail. No
query execution; no data access.

## Why you'd use it

- **Application developers** — statically reject queries that use
  unsupported features before they hit the database. Stable JSON
  contract for tooling.
- **Routing layers** — preview UPDATE shape and target graphs
  before running. Branch on `kind` / `with_graph` / `template_graphs`
  to route to the right transaction or audit channel.
- **Operators** — log incoming SPARQL workload shape (form
  distribution, average BGP size, UPDATE-vs-SELECT ratio)
  without joining the database audit trail.
- **Data scientists** — a quick `EXPLAIN`-style sanity check
  during query authoring.

## SELECT / ASK example

```sql
SELECT pgrdf.sparql_parse(
  'SELECT ?s WHERE { ?s ?p ?o
                     OPTIONAL { ?s <http://x/n> ?n } }');
```

```json
{
  "form":                "SELECT",
  "projection":          ["s"],
  "bgp_triples":         1,
  "modifiers":           ["LeftJoin"],
  "unsupported_algebra": []
}
```

A query that uses a yet-unsupported feature (e.g. CONSTRUCT)
shows up in `unsupported_algebra`:

```sql
SELECT pgrdf.sparql_parse('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }');
--  → {"form": "CONSTRUCT", ..., "unsupported_algebra": ["Construct"]}
```

## UPDATE — per-op detail enrichment

For UPDATE queries, `sparql_parse` mirrors the executor's
runtime classification. Callers can preview which form will fire,
which graphs it targets, and the routing inputs — without
running the mutation.

### Per-op shape

| Op type | Fields |
|---|---|
| `InsertData` | `triples`, `graphs` |
| `DeleteData` | `triples`, `graphs` |
| `DeleteInsert` | `kind` (`INSERT_WHERE` / `DELETE_WHERE` / `DELETE_INSERT_WHERE`), `template_graphs`, `with_graph` |
| `Clear` / `Drop` | `target` (`DEFAULT` / `NAMED <iri>` / `NAMED_ALL` / `ALL`), `silent` |
| `Create` | `target` (`NAMED <iri>`), `silent` |

`template_graphs` collects every template-side graph IRI;
default-graph quads surface as `"DEFAULT"`, variable graphs as
`"?var"`. `with_graph` carries the `WITH <iri>` IRI when the
operation has a single-default `using:` field.

### Example — atomic modify with `WITH`

```sql
SELECT pgrdf.sparql_parse(
  'WITH <http://example.org/g1>
   DELETE { ?s <http://e.com/p> ?o }
   INSERT { ?s <http://e.com/q> ?o }
   WHERE  { ?s <http://e.com/p> ?o }');
```

```json
{
  "form": "UPDATE",
  "ops": [
    {
      "type":            "DeleteInsert",
      "kind":            "DELETE_INSERT_WHERE",
      "with_graph":      "http://example.org/g1",
      "template_graphs": ["DEFAULT"]
    }
  ]
}
```

### Example — lifecycle algebra

```sql
SELECT pgrdf.sparql_parse('DROP SILENT GRAPH <http://example.org/stale>');
--  → {"form": "UPDATE", "ops": [{
--       "type": "Drop",
--       "target": "NAMED http://example.org/stale",
--       "silent": true
--     }]}

SELECT pgrdf.sparql_parse('CLEAR DEFAULT');
--  → {"form": "UPDATE", "ops": [{
--       "type": "Clear",
--       "target": "DEFAULT",
--       "silent": false
--     }]}
```

## Tests

- [`tests/regression/sql/30-sparql-parse.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/30-sparql-parse.sql)
  — SELECT/ASK shape contract.
- [`tests/regression/sql/66-parse-sparql-roundtrip.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/66-parse-sparql-roundtrip.sql).
- Seven new `#[pg_test]` cases lock UPDATE-detail fields
  (kind-narrowing for the three DeleteInsert kinds, `with_graph`
  surfacing, `template_graphs` surfacing, `DeleteData.graphs`
  surfacing, and lifecycle `target` labels across
  CLEAR DEFAULT / DROP GRAPH `<iri>` / CREATE SILENT GRAPH /
  DROP ALL).

## See also

- [SPARQL UPDATE](/v0.5/query/update) — full write surface.
- [Error-message contract](/v0.5/query/error-contract).
