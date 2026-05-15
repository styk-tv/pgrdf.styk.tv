---
title: SPARQL UPDATE — INSERT / DELETE / MODIFY
description: Full SPARQL 1.1 UPDATE surface in pgRDF — INSERT DATA, DELETE DATA, pattern-driven INSERT/DELETE WHERE, atomic DELETE/INSERT/WHERE, graph-scoped WITH and inline GRAPH, plus lifecycle DROP/CLEAR/CREATE.
---

# SPARQL UPDATE

> The full SPARQL 1.1 UPDATE surface — six write forms plus
> the lifecycle algebra — all routed through the same
> `pgrdf.sparql(q TEXT)` UDF you already use for SELECT and ASK.

## What it does

`pgrdf.sparql(q)` dispatches on the parsed form. SELECT/ASK
return solution rows. **UPDATE forms run inside the caller's
transaction** and return a single `_update` summary JSONB row
with the form name and `elapsed_ms`. A rollback unwinds the
mutation.

Every UPDATE form is **graph-scope-aware**:

- `GRAPH <iri> { … }` inside a template or WHERE pattern routes
  to that named graph's partition.
- `WITH <iri>` as a query prefix sets the default graph for the
  WHERE + template inside that operation (W3C §3.1.3 ¶3).
- Cross-graph copy patterns — read from one `GRAPH`, write to
  another — work the way the spec intends.

The lifecycle algebra (`DROP / CLEAR / CREATE GRAPH` with
`DEFAULT / NAMED / ALL` targets and the `SILENT` modifier)
**routes through the SQL UDF surface** ([`drop_graph`](/v0.5/storage/drop-graph),
[`clear_graph`](/v0.5/storage/clear-graph),
[`add_graph(iri)`](/v0.5/storage/named-graphs)) — the SPARQL
forms and the SQL UDFs are two consumers of the same
partition-level primitives.

## Why you'd use it

- **Project managers** — applications that need to write back
  to the graph (CRUD, ETL, periodic refresh) no longer need a
  bespoke layer. Standard SPARQL UPDATE. Standard transaction
  semantics.
- **Data scientists** — `DELETE { … } INSERT { … } WHERE { … }`
  is the canonical "compute a derived shape over the graph and
  swap it in atomically" pattern. One statement. One commit.
- **Ontologists** — load instance data via `INSERT DATA`, fix a
  predicate rename across an entire vocabulary via a pattern-driven
  `DELETE/INSERT WHERE`, version a graph by combining `WITH` +
  `INSERT WHERE`.
- **Backend engineers** — one UDF entry point for read and
  write. Parsing dispatched on form means application code
  doesn't have to branch on SELECT-vs-UPDATE before issuing the
  call.
- **Operators** — UPDATE forms commit with the caller's
  transaction, so transactional discipline (atomicity,
  rollback, isolation) is preserved. `pgrdf.sparql_parse(q)`
  previews shape and target graphs without execution.

## The six write forms

### 1 · `INSERT DATA` — ground triples

Insert literal quads. No pattern. The simplest write form.

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   INSERT DATA {
     ex:alice ex:knows ex:bob .
     ex:alice ex:age   42 .
   }');
--  → {"_update": {"form": "INSERT_DATA", "elapsed_ms": 1.2}}
```

`GRAPH <iri> { … }` works inside the data block:

```sparql
INSERT DATA {
  GRAPH <http://example.org/snap> {
    ex:alice ex:state "frozen" .
  }
}
```

### 2 · `DELETE DATA` — literal triples

Remove specific quads. Symmetric counterpart to `INSERT DATA`.

```sql
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   DELETE DATA { ex:alice ex:age 42 . }');
```

### 3 · `INSERT { template } WHERE { pattern }` — pattern-driven

For every solution mapping of the WHERE pattern, instantiate the
template and insert it. Classic "add derived data" idiom.

```sql
-- "For every person, assert they're an agent."
SELECT * FROM pgrdf.sparql(
  'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   PREFIX ex:   <http://example.com/>
   INSERT { ?p rdf:type ex:Agent }
   WHERE  { ?p rdf:type foaf:Person }');
```

### 4 · `DELETE { template } WHERE { pattern }` — pattern-driven

For every solution mapping, instantiate the template and delete
the matching quads. `DELETE WHERE { pattern }` is the shorthand
when the template equals the pattern.

```sql
-- "Drop every age assertion (no matter the subject)."
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   DELETE { ?s ex:age ?o } WHERE { ?s ex:age ?o }');

-- Shorthand — equivalent.
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   DELETE WHERE { ?s ex:age ?o }');
```

### 5 · `DELETE { … } INSERT { … } WHERE { … }` — atomic modify

The atomic combined form. Compute a WHERE pattern; for each
solution, delete the DELETE template's quads **and** insert the
INSERT template's quads. The canonical "rewrite the graph in one
shot" operation.

```sql
-- Rename a predicate across the entire graph.
SELECT * FROM pgrdf.sparql(
  'PREFIX old: <http://example.com/old/>
   PREFIX new: <http://example.com/new/>
   DELETE { ?s old:title ?t }
   INSERT { ?s new:label ?t }
   WHERE  { ?s old:title ?t }');
```

### 6 · `WITH <iri>` + inline `GRAPH <iri>` — scoped variants

`WITH <iri>` is the prefix shortcut that scopes the WHERE + the
default-graph quads in the template to a single named graph:

```sql
SELECT * FROM pgrdf.sparql(
  'WITH <http://example.org/g1>
   DELETE { ?s ?p ?o }
   WHERE  { ?s <http://example.com/temp> true ; ?p ?o }');
```

Inline `GRAPH <iri>` works inside both template and WHERE:

```sql
SELECT * FROM pgrdf.sparql(
  'INSERT { GRAPH <http://example.org/dst> { ?s ?p ?o } }
   WHERE  { GRAPH <http://example.org/src> { ?s ?p ?o } }');
-- A cross-graph copy. Same as pgrdf.copy_graph for whole-graph
-- copies — but here you can FILTER the WHERE for selective copy.
```

## Lifecycle algebra — `DROP / CLEAR / CREATE GRAPH`

SPARQL's graph-level lifecycle keywords route through the SQL
UDFs you already know:

| SPARQL | Routes to |
|---|---|
| `DROP GRAPH <iri>` | [`pgrdf.drop_graph(id, cascade => TRUE)`](/v0.5/storage/drop-graph) |
| `CLEAR GRAPH <iri>` | [`pgrdf.clear_graph(id)`](/v0.5/storage/clear-graph) |
| `CREATE GRAPH <iri>` | [`pgrdf.add_graph(iri TEXT)`](/v0.5/storage/named-graphs) |

Targets and modifiers:

| Form | Effect |
|---|---|
| `DROP/CLEAR DEFAULT` | Operate on the default graph. |
| `DROP/CLEAR NAMED` | Operate on every named graph except the default. |
| `DROP/CLEAR ALL` | Operate on every graph. |
| `DROP GRAPH <iri>` | One specific named graph. |
| `… SILENT` | Suppress the "graph does not exist" error for absent targets. |
| `CREATE GRAPH <iri>` | Allocate a new named graph with the given IRI. |
| `CREATE SILENT GRAPH <iri>` | Same, but no error if the IRI is already bound. |

```sql
SELECT * FROM pgrdf.sparql('DROP SILENT GRAPH <http://example.org/stale>');
SELECT * FROM pgrdf.sparql('CREATE GRAPH <http://example.org/v3>');
SELECT * FROM pgrdf.sparql('CLEAR DEFAULT');
```

## Previewing without executing — `sparql_parse`

`pgrdf.sparql_parse(q)` mirrors the executor's UPDATE
classification on every op, so callers can preview shape,
target graphs, and routing inputs before running the query.

Per-op shape:

| Op | Detail fields |
|---|---|
| `InsertData` | `triples`, `graphs` |
| `DeleteData` | `triples`, `graphs` |
| `DeleteInsert` | `kind` (`INSERT_WHERE` / `DELETE_WHERE` / `DELETE_INSERT_WHERE`), `template_graphs` (each template-side graph IRI; default-graph quads surface as `"DEFAULT"`, variable graphs as `"?var"`), `with_graph` (the `WITH <iri>` IRI when present) |
| `Clear` / `Drop` | `target` (`DEFAULT` / `NAMED <iri>` / `NAMED_ALL` / `ALL`), `silent` |
| `Create` | `target` (`NAMED <iri>`), `silent` |

```sql
SELECT pgrdf.sparql_parse(
  'WITH <http://example.org/g1>
   DELETE { ?s ex:p ?o } INSERT { ?s ex:q ?o }
   WHERE  { ?s ex:p ?o }');
--  → {"form": "UPDATE", "ops": [{
--       "type": "DeleteInsert",
--       "kind": "DELETE_INSERT_WHERE",
--       "with_graph": "http://example.org/g1",
--       "template_graphs": ["DEFAULT"]
--     }]}
```

## Worked end-to-end example — atomic predicate rename

```sql
-- 1. Stage some data.
SELECT pgrdf.parse_turtle('
@prefix ex: <http://example.com/> .
ex:alice ex:title "Engineer" .
ex:bob   ex:title "Manager" .
', 100);

-- 2. Rename ex:title to ex:role across the whole graph in one shot.
BEGIN;
  SELECT * FROM pgrdf.sparql(
    'PREFIX ex: <http://example.com/>
     DELETE { ?s ex:title ?t }
     INSERT { ?s ex:role  ?t }
     WHERE  { ?s ex:title ?t }');
  --  → {"_update": {"form": "DELETE_INSERT_WHERE", "elapsed_ms": ...}}
COMMIT;

-- 3. Verify.
SELECT * FROM pgrdf.sparql(
  'PREFIX ex: <http://example.com/>
   SELECT ?s ?r WHERE { ?s ex:role ?r }');
--  → {"s": "http://example.com/alice", "r": "Engineer"}
--  → {"s": "http://example.com/bob",   "r": "Manager"}
```

If anything between `BEGIN` and `COMMIT` fails — including
inside the UPDATE — the entire rename rolls back. No half-state.

## Tests

- SQL-side regression: `tests/regression/sql/93-…99-…sql` —
  one fixture per UPDATE form (INSERT DATA, DELETE DATA,
  INSERT/WHERE, DELETE/WHERE, DELETE+INSERT/WHERE, lifecycle).
- W3C-shape conformance:
  - [`tests/w3c-sparql/27-update-insert-data/`](https://github.com/styk-tv/pgRDF/tree/main/tests/w3c-sparql) — §3.1.1 INSERT DATA, default + named graph.
  - [`tests/w3c-sparql/28-update-delete-where/`](https://github.com/styk-tv/pgRDF/tree/main/tests/w3c-sparql) — §3.1.3 DELETE WHERE pattern-driven.
  - [`tests/w3c-sparql/29-update-with-graph-scope/`](https://github.com/styk-tv/pgRDF/tree/main/tests/w3c-sparql) — §3.1.3 ¶3 `WITH <g>` scopes WHERE + template.
- Each UPDATE fixture uses `setup.sql` instead of `data.ttl` —
  UPDATE forms LAND state via the query itself, so a default
  seed path would pre-stage the rows the query is supposed to
  produce.
- Test bar at v0.4.3: **259 automated tests** (166 pgrx + 61
  pg_regress + 29 W3C-SPARQL + 3 LUBM).

## See also

- [BGP joins](/v0.5/query/bgp-joins) — read counterpart to
  `INSERT WHERE`.
- [`sparql_parse`](/v0.5/query/sparql-parse) — preview UPDATE
  shape and routing without execution.
- [GRAPH `<iri> { … }`](/v0.5/query/graph-clause) — the same
  scoping mechanic applies inside UPDATE templates / WHERE.
- [Graph lifecycle UDFs](/v0.5/storage/lifecycle) — the SQL
  UDFs the SPARQL `DROP / CLEAR / CREATE GRAPH` forms route
  through.
- [Forward edge — what's next](/v0.5/query/roadmap) — CONSTRUCT
  (Phase D), property paths.
