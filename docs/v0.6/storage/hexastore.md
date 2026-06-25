---
title: Hexastore + dictionary
description: Every quad is stored once and indexed three ways (SPO/POS/OSP); every term is interned once in the dictionary. Proven at billion scale on the full 8.2 B graph.
---

# Hexastore + dictionary

> Every quad is stored once and indexed three ways (SPO, POS, OSP).
> Every IRI, blank node, and literal is interned once in
> `_pgrdf_dictionary`. Proven at **billion scale** on the full
> 8.2-billion-triple graph.

## What it does

The storage engine combines two structural choices into one
low-cost-to-query layout:

1. **Dictionary encoding.** Every distinct term (IRI, blank node,
   literal — including its datatype/lang tag) lives once in
   `_pgrdf_dictionary` with an `i64` id. Quads store four ids,
   not four strings.
2. **Hexastore-style covering indexes.** `_pgrdf_quads` carries
   three covering indexes — **SPO**, **POS**, **OSP** — so any
   bound-variable shape of a SPARQL triple pattern hits a real
   index.

Together these mean storage is near-optimal (no repeated strings) and
triple-pattern lookups are O(log n) with a sequential-scan-friendly
layout. The same layout holds at billion scale: the full
8.2-billion-triple Wikidata graph stores as **1,801,847,593** distinct
dictionary terms over a complete SPO/POS/OSP hexastore in **~2.0 TB**
(heap 729 GB + indexes 1448 GB) on a single PostgreSQL instance.

## Why you'd use it

- **Project managers** — disk and memory cost stay linear in the
  number of distinct terms, not the triple count. Loading the same
  predicates millions of times doesn't blow up storage.
- **Data scientists** — ad-hoc joins from `_pgrdf_quads` pick the
  right index automatically. No need to hint the planner.
- **Ontologists** — the lattice of `rdf:type` and `rdfs:subClassOf`
  edges takes orders of magnitude less storage than a naive text-keyed
  table.

## Example

```sql
-- Inspect the dictionary (term_type 1 = IRI, 2 = literal, 3 = blank).
SELECT * FROM pgrdf._pgrdf_dictionary
 WHERE term_type = 1 LIMIT 5;
--  id │ value                                                  │ term_type
-- ────┼────────────────────────────────────────────────────────┼───────────
--   1 │ http://www.w3.org/1999/02/22-rdf-syntax-ns#type         │ 1
--   2 │ http://xmlns.com/foaf/0.1/name                          │ 1
--  …

-- Use the indexes implicitly through SPARQL.
SELECT * FROM pgrdf.sparql(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT ?s WHERE { ?s a foaf:Person }');
-- Hits the POS index (predicate + object bound, subject free).
```

## How it works

The dictionary table interns each term and enforces uniqueness on the
full term identity. To stay within PostgreSQL's 2704-byte btree key
limit at billion-term scale, the `unique_term` constraint is keyed on a
generated `lexical_md5 BYTEA` column (a fixed 16-byte hash of the
lexical value) together with `term_type`, datatype, and language —
rather than embedding the raw lexical value, which a single long
literal can otherwise push past the btree limit and abort the index
build.

The quads table:

```sql
CREATE TABLE pgrdf._pgrdf_quads (
  subject_id   BIGINT NOT NULL,
  predicate_id BIGINT NOT NULL,
  object_id    BIGINT NOT NULL,
  graph_id     BIGINT NOT NULL,
  is_inferred  BOOLEAN NOT NULL DEFAULT FALSE
) PARTITION BY LIST (graph_id);

CREATE INDEX … ON _pgrdf_quads (subject_id, predicate_id, object_id);  -- SPO
CREATE INDEX … ON _pgrdf_quads (predicate_id, object_id, subject_id);  -- POS
CREATE INDEX … ON _pgrdf_quads (object_id, subject_id, predicate_id);  -- OSP
```

The covering indexes carry `INCLUDE (is_inferred)`. See
[`docs/02-storage.md`](https://github.com/styk-tv/pgRDF/blob/main/docs/02-storage.md)
for the index strategy and `is_inferred` semantics.

## More index permutations on a carved graph — roadmap

The three covering indexes (SPO/POS/OSP) are the at-scale default: at
billions of triples the index set is already the largest part of the
on-disk footprint, so adding permutations costs storage and build
time. A **smaller, carved-out graph** (a subset of the source graph)
can afford the full six hexastore permutations plus a `pg_trgm` string
index for substring search — turning the carved graph into a fast
analytical surface over a slice of the full graph. This carving + extra
indexing is a **roadmap** item — see the [Roadmap](/v0.6/roadmap/).

## Tests

- [`tests/regression/sql/10-dict-roundtrip.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/10-dict-roundtrip.sql)
  — dictionary put/get round-trip.
- Every SPARQL test in the [W3C-shape suite](/v0.6/query/) exercises
  the index choice for that pattern's bound-variable shape.

## See also

- [Native staged bulk loader](/v0.6/storage/staged-loader) — what
  writes the hexastore at billion scale.
- [Term types](/v0.6/storage/term-types) — what `term_type` actually
  encodes.
- [Shared-memory dictionary cache](/v0.6/storage/shmem-cache).
