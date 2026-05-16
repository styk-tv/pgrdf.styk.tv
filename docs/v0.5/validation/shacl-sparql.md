# SHACL-SPARQL + the W3C SHACL manifest runner

> v0.5.0 ships the **`mode => 'sparql'`** surface for SHACL
> custom constraint components, and wires the **W3C SHACL
> manifest runner** into CI. The surface is shipped and honest;
> the SHACL-SPARQL constraint *execution* engine is a documented
> upstream gate (**E-012**) — not a pgRDF defect.

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

```sql
SELECT pgrdf.validate(1, 2, mode => 'sparql');
```

`pgrdf.validate(…, mode => 'sparql')` is a shipped, callable
surface in v0.5.0. It parses and routes SHACL-SPARQL shapes and
returns the same `sh:ValidationReport`-shape JSONB. It is
**honest about its boundary**: the actual evaluation of embedded
SPARQL constraint components depends on the upstream
[`rudof`](https://github.com/rudof-project/rudof) `shacl` crate
shipping that execution path (tracked upstream as #21 / #94, and
in pgRDF as erratum **E-012**). The surface does not silently
mis-report — it is clear about what the upstream engine does and
does not yet execute. The default `mode => 'native'` is
unaffected: it is genuine W3C SHACL Core, 25/25.

::: tip Documented upstream gate, not a missing feature
E-012 is a third-party dependency boundary. The pgRDF side —
parsing, routing, the `mode` argument, the report shape — is
built. The SHACL-SPARQL evaluation engine lands when `rudof`
ships it upstream. This is the same kind of honest dependency
note as E-011 (RDF 1.2 / crates.io, gated on
[`gtfierro/reasonable#50`](https://github.com/gtfierro/reasonable/issues/50)).
:::

## W3C SHACL manifest runner

The reference [SHACL test suite](https://github.com/w3c/data-shapes)
ships as a Turtle manifest pointing at paired
data/shapes/report fixtures. v0.5.0 wires a runner against this
manifest into CI, the way the SPARQL test surface is wired via
[`tests/w3c-sparql/`](/v0.5/query/). The native SHACL Core path
runs at **25/25** on the W3C SHACL Core suite — that is the
"genuine SHACL Core" claim the rest of this pillar makes.

## Tracked at

[`SPEC.pgRDF.LLD.v0.5-FUTURE.md §5–§6`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.LLD.v0.5-FUTURE.md)
and erratum **E-012**.
