# <span class="material-symbols-outlined icon-blue">verified</span>Pillar 4 — Validation (SHACL Core)

`pgrdf.validate(data_graph_id BIGINT, shapes_graph_id BIGINT, mode TEXT DEFAULT 'native') → JSONB`
validates the data graph against the shapes graph and returns a
**W3C `sh:ValidationReport`-shape** JSONB document.

The default `mode => 'native'` is **genuine W3C SHACL Core** —
the full SHACL Core constraint set, conformant against the W3C
SHACL Core test suite at **25/25**. Backed by the
[`shacl`](https://crates.io/crates/shacl) crate (`0.3.2`) from the
[rudof project](https://github.com/rudof-project/rudof).
The `mode` argument also exposes `'sparql'` for SHACL-SPARQL custom
constraints — the working rudof `SparqlEngine`. A pgRDF-native
SHACL-SPARQL engine (`'pgrdf'`) is on the
[roadmap](/v0.6/roadmap/). See [SHACL-SPARQL](/v0.6/validation/shacl-sparql).

## Topics in this pillar

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> [**Mental model**](/v0.6/validation/mental-model).
- <span class="material-symbols-outlined">description</span> [**Worked example**](/v0.6/validation/example) — minCount, datatype, nodeKind constraints.
- <span class="material-symbols-outlined">verified</span> [**SHACL Core components**](/v0.6/validation/shacl-components) — what's supported.
- <span class="material-symbols-outlined">fact_check</span> [**Report as data**](/v0.6/validation/report-as-data) — querying violations with regular SQL.
- <span class="material-symbols-outlined">verified</span> [**SHACL-SPARQL**](/v0.6/validation/shacl-sparql) — the `mode => 'sparql'` custom-constraint surface (the working rudof `SparqlEngine`); a pgRDF-native `'pgrdf'` engine is on the [roadmap](/v0.6/roadmap/).

</div>

## At a glance

```sql
SELECT pgrdf.validate(1, 2);
--  → { "conforms": false, "results": [ {...}, {...} ] }
```

[**Next — Mental model →**](/v0.6/validation/mental-model)

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

Validation is the simplest of the four pillars conceptually — one
UDF, one report — but the SHACL Core surface is broad. Take the
pages in order:

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> **Start with the [Mental model](/v0.6/validation/mental-model)** — what a shapes graph is, what a validation report is, why this matters.
- <span class="material-symbols-outlined">description</span> **Run the [Worked example](/v0.6/validation/example)** — minCount + datatype + nodeKind constraint composition, end-to-end in psql.
- <span class="material-symbols-outlined">verified</span> **Read the [SHACL Core components](/v0.6/validation/shacl-components) reference** — what's supported and what's not. Bookmark this page.
- <span class="material-symbols-outlined">fact_check</span> **Then [Report as data](/v0.6/validation/report-as-data)** — SHACL reports are JSONB. Querying violations with regular SQL is the gate-ingestion idiom.
- <span class="material-symbols-outlined">verified</span> **Then [SHACL-SPARQL](/v0.6/validation/shacl-sparql)** — the `mode => 'sparql'` surface for custom constraint components defined as embedded SPARQL, run through the working rudof `SparqlEngine`; a pgRDF-native `'pgrdf'` engine is on the [roadmap](/v0.6/roadmap/).

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">school</span> [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/) — the W3C recommendation.
- <span class="material-symbols-outlined">school</span> [SHACL Playground](https://shacl.org/playground/) — paste a data graph + shapes graph, see the report in your browser. Great for prototyping.
- <span class="material-symbols-outlined">code</span> [rudof project's `shacl` crate](https://crates.io/crates/shacl) — the engine pgRDF wraps for `'native'` and `'sparql'`.
- <span class="material-symbols-outlined">school</span> Knublauch & Kontokostas, *Validating RDF Data* — book on SHACL by the spec editors.

</div>
