---
title: CONSTRUCT — graph-shaped result rows
description: pgrdf.construct(q TEXT) returns SETOF JSONB rows shaped {subject, predicate, object}. Snapshot, view, or rewrite a subgraph in one query.
---

# <span class="material-symbols-outlined icon-orange">rocket_launch</span>CONSTRUCT — graph-shaped result rows

> The canonical SPARQL form for **snapshotting a subgraph**,
> **materialising a view**, or feeding a graph-rewrite pipeline.
> Currently shipping on `main` — Phase D, pre-release.

::: warning In flight
This surface is landing on the pgRDF `main` branch right now
(Phase D countdown slices 54-59 — `pgrdf.construct(q)` foundation,
variable substitution, blank-node templates, multi-triple
templates, GRAPH-scoped WHERE, WHERE-shorthand). It will tag in
the next release (post-v0.4.3). The shape described below is
what's on `main` today.
:::

## What it does

```
pgrdf.construct(q TEXT) → SETOF JSONB
```

For every solution of the WHERE clause, the SPARQL `CONSTRUCT`
template is instantiated. Each instantiated triple is emitted as
one JSONB row of shape:

```json
{"subject": "<iri-or-bnode>", "predicate": "<iri>", "object": "<iri-or-bnode-or-literal>"}
```

This is directly pipeable into `INSERT INTO ... SELECT`, a
Postgres `VIEW`, an `INSERT DATA` SPARQL UPDATE in another graph,
or any tabular consumer.

## Why you'd use it

<div class="icon-bullets">

- <span class="material-symbols-outlined">groups</span> **Project managers** — capture a subgraph as a row set you can hand to downstream tools. A snapshot, a report extract, or an ETL hand-off — one SQL call, no bespoke serialisation.
- <span class="material-symbols-outlined">query_stats</span> **Data scientists** — fold a graph-shaped feature into a Postgres `VIEW`. SELECT against the view in your existing pipelines. No leave-and-re-enter SPARQL.
- <span class="material-symbols-outlined">school</span> **Ontologists** — express the canonical "compute the shape, then assert it" pattern (the same one `INSERT WHERE` uses, but as a *read* with the result on the wire instead of in the graph).
- <span class="material-symbols-outlined">code</span> **Backend engineers** — read-only counterpart to the [SPARQL UPDATE](/v0.5/query/update) surface. Same template + WHERE pattern; result is rows, not a mutation.
- <span class="material-symbols-outlined">settings</span> **Operators** — observe what an `INSERT WHERE` *would* assert without committing.

</div>

## Surface as it stands on `main`

The slice countdown reveals the order capabilities landed:

| Phase D slice | Feature |
|---|---|
| 59 | `pgrdf.construct(q)` foundation with **constant-only** templates (no template variables). |
| 58 | **Variable substitution** in templates — `?s ?p ?o` from the WHERE solution flows into the template. |
| 57 | **Blank-node templates** with fresh-per-solution labels — `_:b` in the template becomes a distinct blank node per solution row. |
| 56 | **Multi-triple templates** with shared per-solution bnodes — a `_:b` referenced twice in the template shares one identity per solution. |
| 55 | **GRAPH-scoped WHERE** — `WHERE { GRAPH <iri> { ?s ?p ?o } }` routes to a named graph partition. |
| 54 | **WHERE-shorthand form** with W3C BGP restrictions — the `CONSTRUCT WHERE { … }` short form (template = WHERE pattern). |

The remaining Phase D slices (53 → cut) close out tests, docs,
spec sync, and the release tag.

## Examples

### Constant-only template

```sql
-- "Always emit a marker triple, once per matching subject."
SELECT * FROM pgrdf.construct(
  'PREFIX ex: <http://example.com/>
   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   CONSTRUCT { ex:audit rdf:type ex:Marker }
   WHERE     { ?s ex:reviewed true }');
--  → {"subject": "http://example.com/audit",
--     "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
--     "object": "http://example.com/Marker"}
--  (one row per matching ?s)
```

### Variable substitution

```sql
-- "Every Person becomes an Agent — read-only projection."
SELECT * FROM pgrdf.construct(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   PREFIX ex:   <http://example.com/>
   PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   CONSTRUCT { ?p rdf:type ex:Agent }
   WHERE     { ?p rdf:type foaf:Person }');
```

### Blank-node template — fresh per solution

```sql
-- "For every person, mint a fresh contact node and attach their mailbox."
SELECT * FROM pgrdf.construct(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   PREFIX ex:   <http://example.com/>
   CONSTRUCT {
     ?p ex:contact _:c .
     _:c foaf:mbox ?m .
   }
   WHERE { ?p foaf:mbox ?m }');
```

The two occurrences of `_:c` in the template share a single
identity **per solution row** — every solution gets a fresh
`_:c`, but within one row the same `_:c` is referred to twice.

### GRAPH-scoped WHERE

```sql
-- "Snapshot the v3.7-staging graph."
SELECT * FROM pgrdf.construct(
  'CONSTRUCT { ?s ?p ?o }
   WHERE { GRAPH <http://example.org/v3.7-staging> { ?s ?p ?o } }');
```

### WHERE-shorthand

```sql
-- Template equals the WHERE pattern — the W3C "CONSTRUCT WHERE {…}"
-- short form. Restricted to BGPs (no OPTIONAL/UNION/etc. inside).
SELECT * FROM pgrdf.construct(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   CONSTRUCT WHERE { ?s foaf:name ?n }');
```

## Composing with regular SQL

Because the result is a `SETOF JSONB`, you can fold a CONSTRUCT
into a Postgres view, materialise it into a table, or pipe it
into a SPARQL UPDATE in another graph:

```sql
-- Materialise a CONSTRUCT into a relational table.
CREATE TABLE reports.person_agents AS
SELECT
    (t ->> 'subject')   AS person_iri,
    (t ->> 'predicate') AS predicate_iri,
    (t ->> 'object')    AS object_iri
  FROM pgrdf.construct(
    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
     PREFIX ex:   <http://example.com/>
     PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
     CONSTRUCT { ?p rdf:type ex:Agent }
     WHERE     { ?p rdf:type foaf:Person }') AS t;
```

## See also

- [SPARQL UPDATE](/v0.5/query/update) — write counterpart with
  the same template-from-pattern shape.
- [GRAPH clause](/v0.5/query/graph-clause) — the inner WHERE can
  be graph-scoped.
- [Roadmap](/v0.5/query/roadmap) — Phase D close-out and the
  Phase E / v0.5 forward edge.
