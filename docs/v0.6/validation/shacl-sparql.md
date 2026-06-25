# SHACL-SPARQL + the W3C SHACL manifest runner

> `pgrdf.validate` exposes a `mode` value for SHACL custom constraint
> components defined as embedded SPARQL, and wires the **W3C SHACL
> manifest runner** into CI. SHACL-SPARQL constraints run through
> `mode => 'sparql'` — the rudof `SparqlEngine`, working since the
> upstream `shacl 0.3.2` crate closed the gap. A pgRDF-native
> SHACL-SPARQL engine (`mode => 'pgrdf'`) is on the
> [roadmap](/v0.6/roadmap/).

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
-- SHACL-SPARQL constraints run through the 'sparql' mode
SELECT pgrdf.validate(1, 2, mode => 'sparql');
```

`mode => 'sparql'` parses and routes SHACL-SPARQL shapes and returns
the same `sh:ValidationReport`-shape JSONB as the default `'native'`
path. It dispatches the embedded SPARQL to the rudof `SparqlEngine`
shipped in the [`shacl`](https://crates.io/crates/shacl) crate
(`0.3.2`): the engine compiles `sh:sparql` / `sh:select` / `sh:ask`
constraints into its IR, resolves the shape's target set, and
evaluates each constraint to produce `sh:ValidationResult` entries.

The default `mode => 'native'` is unaffected: it is genuine W3C
SHACL Core, 25/25.

::: tip A pgRDF-native engine is on the roadmap
Today `mode => 'sparql'` rehydrates the data graph as N-Triples and
parses it into rudof's in-memory graph, so it scales with that
in-memory copy rather than with PostgreSQL. A **pgRDF-native**
SHACL-SPARQL engine (`mode => 'pgrdf'`, Track H) is on the
[roadmap](/v0.6/roadmap/): it would evaluate each `sh:sparql` /
`sh:select` constraint directly against the dictionary-indexed
hexastore — no N-Triples rehydrate — reusing the same query path
that powers `pgrdf.sparql`. It is **not shipped** today; the
`'sparql'` mode is the working SHACL-SPARQL path.
:::

## Choosing a mode

| `mode` | Engine | Use it for |
|---|---|---|
| `'native'` (default) | rudof SHACL Core | All SHACL Core constraints — genuine W3C SHACL Core 25/25. |
| `'sparql'` | rudof `SparqlEngine` | `sh:sparql` / `sh:select` / `sh:ask` custom constraints — the working SHACL-SPARQL path. |
| `'pgrdf'` | pgRDF-native SHACL-SPARQL | **Roadmap** (Track H) — direct hexastore evaluation. Not shipped; see the [roadmap](/v0.6/roadmap/). |

An unknown `mode` raises an error before any work runs — there is
no silent fallback.

## W3C SHACL manifest runner

The reference [SHACL test suite](https://github.com/w3c/data-shapes)
ships as a Turtle manifest pointing at paired
data/shapes/report fixtures. pgRDF wires a runner against this
manifest into CI, the way the SPARQL test surface is wired via
[`tests/w3c-sparql/`](/v0.6/query/). The native SHACL Core path
runs at **25/25** on the W3C SHACL Core suite — that is the
"genuine SHACL Core" claim the rest of this pillar makes.

## Tests

- [`tests/regression/sql/122-shacl-modes.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/122-shacl-modes.sql)
  — the `mode` field + default, unknown-mode error, `'native'`
  ignoring a `sh:sparql` block while still flagging the Core
  violation, and the `'sparql'` structured report.
- [`tests/w3c-shacl/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-shacl/README.md)
  — the W3C SHACL Core manifest gate (25/25, `conforms` invariant).
