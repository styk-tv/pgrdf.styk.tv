# The mental model

You loaded an ontology + some assertions. Behind every assertion
there is a **chain of entailments** — subclass closures,
subproperty closures, equivalence cycles, inverse-property
completions, transitive-property propagations, individual-equality
unfoldings.

`pgrdf.materialize(graph_id)` writes that chain back into the
graph as real rows. Each entailed quad has
`is_inferred = TRUE`. Each base quad has `is_inferred = FALSE`
(the default).

```mermaid
flowchart TB
    A["Base graph<br/><i>is_inferred = FALSE</i>"]:::base
    B["OWL 2 RL reasoner<br/>(reasonable)"]:::engine
    C["Inferred quads<br/><i>is_inferred = TRUE</i>"]:::inferred
    A -->|input| B
    B -->|forward chaining| C
    C -->|written back to same graph_id| A
    classDef base fill:#336791,color:#fff,stroke:#244a64;
    classDef engine fill:#0f9d6e,color:#fff,stroke:#0d8a61;
    classDef inferred fill:#e8a23a,color:#000,stroke:#c5851c;
```

After materialization, SPARQL queries against the graph see both
the base **and** the inferred quads as a single, flat triple-set.
Your application doesn't need to know which is which — but
operator queries can filter by `is_inferred` to inspect the
breakdown.

## What changes after a materialize call

| Before | After `pgrdf.materialize(g)` |
|---|---|
| `?s a ex:Engineer`, `ex:Engineer ⊑ ex:Person`, `ex:Person ⊑ ex:Agent` | The two transitive type assertions are now present as rows: `?s a ex:Person`, `?s a ex:Agent` |
| `?a ex:knows ?b`, `ex:knows owl:inverseOf ex:knownBy` | The inverse `?b ex:knownBy ?a` is now present as a row |
| `ex:eq owl:sameAs ?a`, `?a ex:prop ?x` | `ex:eq ex:prop ?x` is now present (sameAs propagation) |

## The return value

`pgrdf.materialize` returns a JSONB summary:

```json
{
  "base_triples":              3,
  "inferred_triples_written":  11,
  "total_after":               14,
  "elapsed_ms":                42.1
}
```

`base_triples` and `inferred_triples_written` always sum to
`total_after` (modulo de-duplication of equivalent entailments).
Both `base_triples = 0` and `inferred_triples_written = 0` are
valid for an empty graph; the call is still safe.

## Cost shape

Materialization is **forward-chaining**: the reasoner computes
all entailments up front, in memory, then writes the difference
back as a bulk insert. The runtime is dominated by the size of
the inferred set, not the base set. Large ontologies with
deep subclass hierarchies inflate cost.

The call holds the partition's row set for the duration. Plan
materialization runs as part of off-hours batch ingestion, not
inside an interactive request handler.

[**Next — Worked example →**](/v0.5/inference/example)
