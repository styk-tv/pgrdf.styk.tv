# Inline Turtle ingest

> Same parser as `load_turtle`, no filesystem dependency. Pass the
> Turtle source as a SQL text literal.

## What it does

`pgrdf.parse_turtle(content TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL) → BIGINT`

Parses Turtle directly from a string argument. Returns the triple
count loaded. Useful when you don't want to land a file on the
server first — notebooks, orchestration code, prompt-driven
synthetic graphs, and test fixtures all benefit.

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

- [Load Turtle from disk](/v0.4/storage/load-turtle) — file path
  variant.
- [Verbose ingest statistics](/v0.4/storage/verbose-stats) —
  sibling `pgrdf.parse_turtle_verbose` returns JSONB.
