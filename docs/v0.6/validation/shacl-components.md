# SHACL Core components

> What constraint components are supported and what each one asserts.

## Target selectors — which nodes to validate

| Component | Effect |
|---|---|
| `sh:targetClass <C>` | Pick every instance of class `C` as a focus node. |
| `sh:targetNode <iri>` | Pick a specific IRI as a focus node. |
| `sh:targetSubjectsOf <p>` | Pick every subject of predicate `p`. |
| `sh:targetObjectsOf <p>` | Pick every object of predicate `p`. |

## Cardinality and shape

| Component | Asserts |
|---|---|
| `sh:minCount n` | At least `n` values on the path. |
| `sh:maxCount n` | At most `n` values on the path. |

## Type constraints

| Component | Asserts |
|---|---|
| `sh:datatype <xsd:string>` | Value is a literal of the given datatype. |
| `sh:nodeKind sh:IRI` / `sh:Literal` / `sh:BlankNode` / `sh:IRIOrLiteral` / `sh:BlankNodeOrIRI` / `sh:BlankNodeOrLiteral` | Value is of the given RDF node kind. |
| `sh:class <C>` | Value is an instance of class `C`. |

## Value-set constraints

| Component | Asserts |
|---|---|
| `sh:in (a b c)` | Value is one of the enumerated values. |

## String constraints

| Component | Asserts |
|---|---|
| `sh:minLength n` / `sh:maxLength n` | Length bounds on the literal's lexical form. |
| `sh:pattern "regex"` | Regex match against the literal's lexical form. Optional `sh:flags`. |

## Numeric range

| Component | Asserts |
|---|---|
| `sh:minInclusive n` / `sh:maxInclusive n` | Inclusive numeric bounds. |
| `sh:minExclusive n` / `sh:maxExclusive n` | Exclusive numeric bounds. |

## Composition

| Component | Asserts |
|---|---|
| `sh:property [ … ]` | Apply the property-shape body to a property path. |
| `sh:path <p>` | The path the property shape targets. |
| `sh:and`, `sh:or`, `sh:not`, `sh:xone` | Boolean composition of nested shape references. |

## Severity

| Component | Effect |
|---|---|
| `sh:severity sh:Info` / `sh:Warning` / `sh:Violation` (default) | Choose the result severity reported in `resultSeverity`. |

## Beyond SHACL Core

| Component | Status |
|---|---|
| SHACL-SPARQL constraint components (`sh:sparql`, `sh:select`, `sh:ask`) | Reachable via `pgrdf.validate(…, mode => 'sparql')` — the working rudof `SparqlEngine`, shipped in the `shacl 0.3.2` crate. It parses and evaluates `sh:sparql` / `sh:select` / `sh:ask` constraints and returns the same `sh:ValidationReport`-shape JSONB. A pgRDF-native SHACL-SPARQL engine (`mode => 'pgrdf'`, Track H) is on the [roadmap](/v0.6/roadmap/), not shipped. See [SHACL-SPARQL](/v0.6/validation/shacl-sparql). |

The full SHACL Core component set above is shipped — including
property paths in `sh:path` (the same [SPARQL property-path](/v0.6/query/property-paths)
engine, alternation / sequence / inverse).

## Conformance + tests

`mode => 'native'` is **genuine W3C SHACL Core**, conformant
against the W3C SHACL Core test suite at **25/25**. The engine is
exercised end-to-end by
[`tests/regression/sql/71-shacl-real.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/71-shacl-real.sql),
and the W3C SHACL manifest runner is wired into CI under
[`tests/w3c-shacl/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-shacl/README.md)
(part of the **294 pgrx + 93 pg_regress + 51 W3C-SPARQL + 25 W3C
SHACL Core + 3 LUBM** test bar).
