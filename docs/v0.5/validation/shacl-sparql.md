# 🚀 Forward edge — SHACL-SPARQL + manifest runner

> v0.5 adds custom SPARQL-defined constraint components and wires
> the **W3C SHACL manifest runner** into CI for full-suite
> conformance.

This page is forward-looking. The surfaces described here are not
yet callable on `main`.

## SHACL-SPARQL — custom constraint components

The SHACL standard allows constraints to be defined as embedded
SPARQL `SELECT` or `ASK` queries:

```turtle
ex:UniqueEmailConstraint a sh:ConstraintComponent ;
    sh:parameter [ sh:path sh:property ] ;
    sh:validator [
        a sh:SPARQLAskValidator ;
        sh:ask """
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          ASK { ?value foaf:mbox $this . FILTER(?value != $this) }
        """ ] .
```

v0.5 will let you define and evaluate such constraint components
against the same `pgrdf.validate` UDF.

## W3C SHACL manifest runner

The reference [SHACL test suite](https://github.com/w3c/data-shapes)
ships as a Turtle manifest pointing at hundreds of paired
data/shapes/report fixtures. v0.5 wires a runner against this
manifest into CI, the way the SPARQL test surface is wired today
via [`tests/w3c-sparql/`](/v0.5/query/).

Coverage ramp target: the same `≥ 30 % → ≥ 70 % → ≥ 95 %` ramp
the v0.3 SPARQL conformance suite used.

## Tracked at

[`SPEC.pgRDF.LLD.v0.5-FUTURE.md §5–§6`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md).
