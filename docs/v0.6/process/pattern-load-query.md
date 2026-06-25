---
title: "Pattern: Load → Query"
description: A worked journey — load a small FOAF dataset, run a basic SELECT, then refine it with OPTIONAL and see unbound values come back as null. Real data and real output from the pgRDF W3C-SPARQL suite. Queryable at any scale, including the full 8.2-billion-triple graph.
---

# <span class="material-symbols-outlined icon-blue">search</span>Pattern — Load → Query

> The simplest semantic process: get RDF in and ask questions of it.
> No inference, no validation, no carving — just the
> [head](/v0.6/process/building-a-chain) and the read.

```mermaid
flowchart LR
    A[Import]:::par --> B[Seal]:::par --> C[Query]:::out
    classDef par fill:#0f9d6e,stroke:#0d8a61,color:#fff;
    classDef out fill:#336791,stroke:#244a64,color:#fff;
```

## When to use it

You have RDF and you want to query it with SPARQL — joined, if you
like, with regular SQL. **This pattern works at any scale**, including
the full [8.2-billion-triple graph](/v0.6/scale/): Query is not the
single-threaded constraint, so there is no carve waist here.

## A worked scenario — people and their mailboxes

Three people; two have a mailbox, one does not.

### Step 1 — load the data

```sql
SELECT pgrdf.add_graph(100);
SELECT pgrdf.parse_turtle('
@prefix ex:   <http://example.com/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice foaf:name "Alice" ; foaf:mbox <mailto:alice@example.com> .
ex:bob   foaf:name "Bob" .
ex:carol foaf:name "Carol" ; foaf:mbox <mailto:carol@example.com> .
', 100);
```

### Step 2 — a basic query

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?n WHERE { ?s foaf:name ?n }');
```

One JSONB row per solution:

```json
{"n": "Alice"}
{"n": "Bob"}
{"n": "Carol"}
```

### Step 3 — refine with OPTIONAL

Pull in the mailbox *where it exists*, without dropping the people who
have none — that is what `OPTIONAL` does:

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?n ?m
   WHERE { ?s foaf:name ?n .
           OPTIONAL { ?s foaf:mbox ?m } }');
```

```json
{"n": "Alice", "m": "mailto:alice@example.com"}
{"n": "Carol", "m": "mailto:carol@example.com"}
{"n": "Bob",   "m": null}
```

Bob keeps his row; his missing mailbox comes back as `null` rather than
removing him from the result.

::: tip Grounded in the test suite
This is [`tests/w3c-sparql/04-optional-chain`](https://github.com/styk-tv/pgRDF/tree/main/tests/w3c-sparql/04-optional-chain)
— the same data, query, and expected output, gated in CI against the
hand-computed W3C result.
:::

## Compose with regular SQL

Because `pgrdf.sparql` is a set-returning function, the result joins
straight into SQL — filter, aggregate, or join it against your own
tables:

```sql
SELECT count(*) AS people_with_mbox
FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?m WHERE { ?s foaf:mbox ?m }');
--  → 2
```

## Next step

Add inference with [Load → Reason → Query](/v0.6/process/pattern-reason),
or a conformance gate with
[Load → Validate → Query](/v0.6/process/pattern-validate).
