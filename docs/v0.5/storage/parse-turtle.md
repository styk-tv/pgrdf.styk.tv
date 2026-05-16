# Inline Turtle / TriG / N-Quads ingest

> Same parser family as `load_turtle`, no filesystem dependency.
> Pass the RDF source as a SQL text literal — Turtle, TriG, or
> N-Quads.

## What it does

`pgrdf.parse_turtle(content TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL) → BIGINT`

Parses Turtle directly from a string argument. Returns the triple
count loaded. Useful when you don't want to land a file on the
server first — notebooks, orchestration code, prompt-driven
synthetic graphs, and test fixtures all benefit.

### Quad-bearing serialisations — TriG + N-Quads

For serialisations that carry the named-graph dimension
themselves, two sibling UDFs ship in v0.5.0:

`pgrdf.parse_trig(content TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL) → BIGINT`
`pgrdf.parse_nquads(content TEXT, graph_id BIGINT) → BIGINT`

Both share the same dictionary + bulk-insert pipeline as
`parse_turtle`. `parse_trig` accepts the TriG `GRAPH <iri> { … }`
block syntax; `parse_nquads` accepts the line-based N-Quads form
where the optional fourth term names the graph. The
`graph_id` argument is the default/fallback graph for triples
that carry no explicit graph in the source.

## Why you'd use it

- **Project managers** — embed seed data for new tenants inline
  in migration scripts; no file deployment needed.
- **Data scientists** — build small graphs in a notebook with
  Python-side string construction, ship them straight into pgRDF.
- **Ontologists** — sketch and load mini-ontologies inline during
  exploration without leaving the SQL prompt.

## Example

```sql
SELECT pgrdf.add_graph(1);

SELECT pgrdf.parse_turtle('
@prefix ex: <http://example.com/> .
ex:alice ex:knows ex:bob .
ex:bob   ex:knows ex:carol .
', 1);
--  → 2

-- Confirm
SELECT pgrdf.count_quads(1);
--  → 2
```

## How it works

`parse_turtle` and `load_turtle` share the same parser + dictionary
+ bulk-insert pipeline; only the source differs (file vs. string).

## Tests

- [`tests/regression/sql/30-sparql-parse.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/30-sparql-parse.sql)
  — used as the canonical setup primitive throughout the regression
  suite.
- [`tests/regression/sql/65-parse-turtle-empty.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/65-parse-turtle-empty.sql)
  — empty string yields a zero-triple ingest.

## See also

- [Load Turtle from disk](/v0.5/storage/load-turtle) — file path
  variant.
- [Verbose ingest statistics](/v0.5/storage/verbose-stats) —
  sibling `pgrdf.parse_turtle_verbose` returns JSONB.
