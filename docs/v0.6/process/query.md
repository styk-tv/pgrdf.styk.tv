---
title: Query — the read verb
description: Query reads a sealed graph with SPARQL 1.1 — SELECT, ASK, CONSTRUCT, DESCRIBE, and the full UPDATE algebra — returning JSONB rows you can join with regular SQL. Backed by pgrdf.sparql, pgrdf.construct, pgrdf.describe.
---

# <span class="material-symbols-outlined icon-blue">search</span>Query

> Read a sealed graph with **SPARQL 1.1**. Query returns JSONB rows
> you can join straight back into regular SQL — no bridge, no second
> protocol.

## What it is

Query parses SPARQL, translates it to SQL over the
[hexastore](/v0.6/storage/hexastore), and executes it through a
per-backend plan cache. Shared variables across triple patterns become
joins; the result is a set of JSONB solution rows.

## How you run it

| UDF | Use it for |
|---|---|
| [`pgrdf.sparql(q TEXT) → SETOF JSONB`](/v0.6/query/) | SELECT / ASK, and the full SPARQL 1.1 UPDATE algebra, dispatched through one UDF. |
| [`pgrdf.construct(q TEXT)`](/v0.6/query/construct) | CONSTRUCT a new RDF graph from a query. |
| [`pgrdf.describe(q TEXT)`](/v0.6/query/) | DESCRIBE (W3C §16.4 Concise Bounded Description). |
| [`pgrdf.sparql_parse(q TEXT)`](/v0.6/query/sparql-parse) | Inspect the algebra without executing — a static gate. |

The read surface is full: multi-pattern BGPs, `FILTER`, `OPTIONAL`,
`UNION`, `MINUS`, `VALUES`, downstream `BIND`, aggregates with
`GROUP BY` / `HAVING`, type-aware `ORDER BY`, `GRAPH`, and
[property paths](/v0.6/query/property-paths).

## Where it sits in a chain

**After [Seal](/v0.6/process/seal); usually last.** Query is the
output verb — it runs on a sealed graph at any time, including after
[Reason](/v0.6/process/reason) has written inferred quads back, so a
post-reasoning query sees the entailed triples too.

::: tip Scaling class — per-query
Query is neither the parallel-ingest class nor the single-threaded
reasoning class: each call plans and executes against the hexastore
with a cached plan. It is not the verb that drives the carve decision —
[Reason](/v0.6/process/reason) and [Validate](/v0.6/process/validate) are.
:::

## Example

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?p ?n WHERE { ?p foaf:name ?n }');
--  → {"p": "http://example.com/alice", "n": "Alice"}
```

## See also

- [Pillar 2 — Semantic query](/v0.6/query/) — the full SPARQL 1.1 surface.
- [Reason](/v0.6/process/reason) — run before Query to materialize entailments first.
