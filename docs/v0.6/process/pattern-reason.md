---
title: "Pattern: Load → Reason → Query"
description: Materialize OWL 2 RL / RDFS entailments, then query the closure. Import, seal, materialize with pgrdf.materialize, then SPARQL sees both asserted and inferred triples. Runs over a graph sized to your box.
---

# <span class="material-symbols-outlined icon-orange">psychology</span>Pattern — Load → Reason → Query

> Materialize the implicit consequences of a graph, then query the
> **closure** — so a query sees entailed facts, not just asserted ones.

```mermaid
flowchart LR
    A[Import]:::par --> B[Seal]:::par --> R[Reason]:::seq --> C[Query]:::out
    classDef par fill:#0f9d6e,stroke:#0d8a61,color:#fff;
    classDef seq fill:#d97706,stroke:#b45c06,color:#fff;
    classDef out fill:#336791,stroke:#244a64,color:#fff;
```

## When to use it

You need queries to return facts that follow from the ontology —
subclass membership, transitive relations, inverses, `sameAs` — not
only the triples literally in the file. The amber [Reason](/v0.6/process/reason)
step is **single-threaded**, so the graph must fit your box (if it does
not, use the [carve pattern](/v0.6/process/pattern-carve)).

## The chain

```sql
-- Head: Import + Seal
SELECT pgrdf.add_graph(100);
SELECT pgrdf.load_turtle('/data/ontology.ttl', 100);

-- Reason: forward-chain the closure (idempotent), writes inferred quads back
SELECT pgrdf.materialize(100, 'owl-rl');
--  → {"base_triples": ..., "inferred_triples_written": ...}

-- Query: now sees asserted AND inferred triples
SELECT * FROM pgrdf.sparql(
  'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX ex: <http://example.com/>
   SELECT ?c WHERE { ex:alice rdf:type ?c }');
```

## Notes

- `materialize` is **idempotent** — re-run it freely; prior inferred rows are dropped and re-derived.
- Pick the profile: `'owl-rl'` (default) or `'rdfs'` — see [Reason](/v0.6/process/reason).

## Next step

Add a conformance gate over the closure with
[Load → Validate → Query](/v0.6/process/pattern-validate), or right-size
a large source with [Ingest → Carve → Reason](/v0.6/process/pattern-carve).
