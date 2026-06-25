# SHACL-SPARQL + the W3C SHACL manifest runner

> `pgrdf.validate` exposes a `mode` value for SHACL custom constraint
> components defined as embedded SPARQL, and wires the **W3C SHACL
> manifest runner** into CI. The **authoritative** SHACL-SPARQL gate is
> `mode => 'pgrdf'` — the **shipped** pgRDF-native handler that
> evaluates `sh:sparql` / `sh:select` / `sh:ask` constraints directly
> against the dictionary-indexed hexastore. The alternate
> `mode => 'sparql'` routes to the rudof `SparqlEngine` and reaches the
> engine, but carries an open correctness caveat — see
> [E-014](#e-014-rudof-sparql-verdict) below.

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
-- SHACL-SPARQL constraints run through the 'pgrdf' mode — the
-- authoritative, shipped SHACL-SPARQL gate
SELECT pgrdf.validate(1, 2, mode => 'pgrdf');
```

`mode => 'pgrdf'` is the **pgRDF-native** SHACL-SPARQL handler
(`run_pgrdf_sparql`). It intercepts the SHACL-SPARQL (`BasicSparql`)
constraints in the shapes graph and evaluates each `sh:sparql` /
`sh:select` / `sh:ask` constraint **directly against the hexastore** —
reusing the same query path that powers `pgrdf.sparql`, with **no
N-Triples rehydration** of the data graph. It returns the same
`sh:ValidationReport`-shape JSONB as the default `'native'` path. It is
**shipped and reachable** (a live `"pgrdf" =>` arm in the validate
dispatch), and is the **authoritative SHACL-SPARQL gate**: it returns
the correct `conforms=false` (3 violations on the W3C `node-sparql-001`
fixture, 4 on the LUBM dev-gate) where the W3C answer is non-conforming.

`mode => 'pgrdf'` only intercepts SHACL-SPARQL (`BasicSparql`)
constraints — use the default `'native'` for SHACL Core.

The default `mode => 'native'` is unaffected: W3C SHACL Core, 25/25.

## E-014 — the rudof `'sparql'` verdict caveat {#e-014-rudof-sparql-verdict}

::: warning E-014 — `'sparql'` is mechanically reachable but returns the wrong verdict
`mode => 'sparql'` routes to the rudof `SparqlEngine` in the
[`shacl 0.3.2`](https://crates.io/crates/shacl) crate. The dispatch
**reaches the engine** and `conforms` is a real Boolean — but the
engine has an **open correctness bug (E-014)**: on common SHACL-SPARQL
topologies where the W3C answer is `conforms=false`, rudof returns
`conforms=true` with **0 violations**. On the W3C fixture
`tests/sparql/node/sparql-001.ttl` the W3C `mf:result` asserts
`conforms=false` with 3 violations; rudof's
`BasicSparqlValidator::validate_sparql` returns `conforms=true`,
`results=[]`. The compiled `IRSchema` carries the
`IRComponent::BasicSparql` constraint correctly — the bug is in the
SparqlEngine's per-focus-node evaluation, not in parsing.

Because of this, `'sparql'` is **not a trusted SHACL-SPARQL gate**. It
is downgraded to a contract assertion only — "dispatch reaches the
engine, `conforms` is a real Boolean" — with no W3C verdict comparison.
For SHACL-SPARQL correctness, use `mode => 'pgrdf'`.

E-014 is upstream-gated on the rudof project. It re-checks on any
subsequent `shacl 0.3.x` / `0.4.x` release; the day the rudof verdict
matches the W3C `mf:result`, the caveat closes and the `'sparql'`
sub-run can re-tighten to the same conformance gate as `'pgrdf'`.
:::

## Choosing a mode

| `mode` | Engine | Use it for |
|---|---|---|
| `'native'` (default) | rudof SHACL Core | All SHACL Core constraints — W3C SHACL Core 25/25. The authoritative SHACL Core engine. |
| `'pgrdf'` | **pgRDF-native** SHACL-SPARQL | **Shipped.** The **authoritative** SHACL-SPARQL gate — `sh:sparql` / `sh:select` / `sh:ask` custom constraints evaluated **directly against the hexastore** (no N-Triples rehydrate). Returns the correct W3C verdict (3 violations on `node-sparql-001`). |
| `'sparql'` | rudof `SparqlEngine` | Reaches the engine, but **E-014**: returns the wrong verdict (`conforms=true`, 0 violations) on common SHACL-SPARQL topologies. **Not a trusted gate** — use `'pgrdf'` for correctness. |

An unknown `mode` raises an error before any work runs — there is
no silent fallback. The error names the supported set:
`validate: unknown mode … (supported: 'native', 'sparql', 'pgrdf')`.

## W3C SHACL manifest runner

The reference [SHACL test suite](https://github.com/w3c/data-shapes)
ships as a Turtle manifest pointing at paired
data/shapes/report fixtures. pgRDF wires a runner against this
manifest into CI, the way the SPARQL test surface is wired via
[`tests/w3c-sparql/`](/v0.6/query/). The native SHACL Core path
runs at **25/25** on the W3C SHACL Core suite — full SHACL Core
conformance, verified in CI. The SHACL-SPARQL manifest gate runs under
`mode => 'pgrdf'` (`tests/w3c-shacl/run.sh --pgrdf`); the rudof
`--sparql` sub-run is the downgraded contract assertion described in
[E-014](#e-014-rudof-sparql-verdict).

## Tests

- [`tests/regression/sql/122-shacl-modes.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/122-shacl-modes.sql)
  — the `mode` field + default, unknown-mode error, `'native'`
  ignoring a `sh:sparql` block while still flagging the Core
  violation, and the `'pgrdf'` structured report.
- [`tests/w3c-shacl/`](https://github.com/styk-tv/pgRDF/blob/main/tests/w3c-shacl/README.md)
  — the W3C SHACL Core manifest gate (25/25, `conforms` invariant),
  plus the `--pgrdf` SHACL-SPARQL conformance gate and the downgraded
  `--sparql` contract sub-run.
