# OWL 2 RL — what the reasoner actually entails

> OWL 2 RL is a profile of OWL 2 designed for **forward-chaining
> rule-based** reasoners. It's sound, complete for its rule set,
> and decidable in polynomial time. pgRDF runs it via the
> [`reasonable`](https://github.com/gtfierro/reasonable) crate.

## Rules that materialize in practice

The rules that fire in real ontologies — and the kind of
implicit knowledge each makes explicit:

| Vocabulary | Effect after `materialize` |
|---|---|
| `rdfs:subClassOf` (with closure) | Every instance of a subclass is asserted as a typed instance of every ancestor class. Transitive across the chain. |
| `rdfs:subPropertyOf` (with closure) | Every triple using a sub-property is mirrored using each super-property. |
| `rdfs:domain` / `rdfs:range` | Subjects of a property acquire its domain class; objects acquire its range class. |
| `owl:equivalentClass` | Class membership is mirrored both ways. |
| `owl:equivalentProperty` | Property assertions are mirrored both ways. |
| `owl:inverseOf` | `(?a p ?b)` materializes `(?b p⁻¹ ?a)`. |
| `owl:TransitiveProperty` | `(a p b), (b p c)` materializes `(a p c)`, transitively. |
| `owl:SymmetricProperty` | `(a p b)` materializes `(b p a)`. |
| `owl:sameAs` | Property assertions and class memberships are replicated across the sameAs equivalence class. |
| `owl:FunctionalProperty` / `owl:InverseFunctionalProperty` | Drives `sameAs` consequences when the data implies it. |
| Class-construction (`owl:intersectionOf`, `owl:unionOf`, `owl:hasValue`, `owl:someValuesFrom`, `owl:allValuesFrom` in OWL 2 RL-permitted shapes) | Class membership is inferred where the construction's conditions hold. |

## What OWL 2 RL deliberately **doesn't** support

The full set of restrictions defining OWL 2 RL is in the W3C
[OWL 2 RL profile spec](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL).
The cliff-notes version of what's outside the rule set:

- General `owl:complementOf` reasoning.
- `owl:oneOf` over uniqueness implications.
- Full description-logic class equivalence (the OWL DL profile is
  computationally harder and is intentionally not supported here).

If your ontology uses constructs outside OWL 2 RL, those parts of
the model don't drive entailments; the rest of the ontology still
materializes as expected.

## Choosing a lighter rule set — the `'rdfs'` profile

`pgrdf.materialize(graph_id, 'rdfs')` (shipped v0.5.0) runs only
the RDFS closures — `rdfs:subClassOf`, `rdfs:subPropertyOf`,
`rdfs:domain`, `rdfs:range` — and skips the OWL 2 RL
equivalence / inverse / transitive / sameAs / class-construction
rules above. It is faster and cheaper per graph; pick it when
your workload only needs the schema closures. The default
(`'owl-rl'`, no argument) is unchanged. See
[Reasoning profile selector](/v0.5/inference/profile-selector).

## A worked rule

`owl:TransitiveProperty` is one of the most useful in practice.
Given:

```turtle
ex:partOf rdf:type owl:TransitiveProperty .
ex:tire   ex:partOf ex:wheel .
ex:wheel  ex:partOf ex:car .
```

After `materialize`, the graph also contains:

```turtle
ex:tire   ex:partOf ex:car .
```

A SPARQL query asking "what is the tire part of?" then returns
both `ex:wheel` and `ex:car` without your application
implementing the transitive closure itself.

## Why a project manager cares

OWL 2 RL is the standard the W3C-aligned ontology community
publishes against. Ontologists ship ontologies in OWL 2 RL
because the rule set is **decidable in polynomial time** — and
pgRDF runs that exact rule set. Application queries written
against the *surface* shape match implicit knowledge without the
application carrying the reasoning burden.

## See also

- [Mental model](/v0.5/inference/mental-model).
- [Worked example](/v0.5/inference/example).
- [`docs/04-inference.md`](https://github.com/styk-tv/pgRDF/blob/main/docs/04-inference.md)
  — engineering doc.
