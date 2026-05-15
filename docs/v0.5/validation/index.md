# <span class="material-symbols-outlined icon-blue">verified</span>Pillar 4 — Validation (SHACL Core)

`pgrdf.validate(data_graph_id BIGINT, shapes_graph_id BIGINT) → JSONB`
validates the data graph against the shapes graph and returns a
**W3C `sh:ValidationReport`-shape** JSONB document.

Backed by the [`shacl` 0.3.x](https://crates.io/crates/shacl) crate
from the [rudof project](https://github.com/rudof-project/rudof).

## Topics in this pillar

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> [**Mental model**](/v0.5/validation/mental-model).
- <span class="material-symbols-outlined">description</span> [**Worked example**](/v0.5/validation/example) — minCount, datatype, nodeKind constraints.
- <span class="material-symbols-outlined">verified</span> [**SHACL Core components**](/v0.5/validation/shacl-components) — what's supported.
- <span class="material-symbols-outlined">fact_check</span> [**Report as data**](/v0.5/validation/report-as-data) — querying violations with regular SQL.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span> [**Forward edge — SHACL-SPARQL**](/v0.5/validation/shacl-sparql) — custom-constraint surface.

</div>

## At a glance

```sql
SELECT pgrdf.validate(1, 2);
--  → { "conforms": false, "results": [ {...}, {...} ] }
```

[**Next — Mental model →**](/v0.5/validation/mental-model)

## <span class="material-symbols-outlined icon-blue">auto_stories</span>Training {#training}

Validation is the simplest of the four pillars conceptually — one
UDF, one report — but the SHACL Core surface is broad. Take the
pages in order:

<div class="icon-bullets">

- <span class="material-symbols-outlined">info</span> **Start with the [Mental model](/v0.5/validation/mental-model)** — what a shapes graph is, what a validation report is, why this matters.
- <span class="material-symbols-outlined">description</span> **Run the [Worked example](/v0.5/validation/example)** — minCount + datatype + nodeKind constraint composition, end-to-end in psql.
- <span class="material-symbols-outlined">verified</span> **Read the [SHACL Core components](/v0.5/validation/shacl-components) reference** — what's supported and what's not. Bookmark this page.
- <span class="material-symbols-outlined">fact_check</span> **Then [Report as data](/v0.5/validation/report-as-data)** — SHACL reports are JSONB. Querying violations with regular SQL is the gate-ingestion idiom.
- <span class="material-symbols-outlined icon-orange">rocket_launch</span> **Bonus — [SHACL-SPARQL](/v0.5/validation/shacl-sparql)** — the v0.5 forward edge: custom constraint components defined as embedded SPARQL.

</div>

### Learn more

<div class="icon-bullets">

- <span class="material-symbols-outlined">school</span> [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/) — the W3C recommendation.
- <span class="material-symbols-outlined">school</span> [SHACL Playground](https://shacl.org/playground/) — paste a data graph + shapes graph, see the report in your browser. Great for prototyping.
- <span class="material-symbols-outlined">code</span> [rudof project's `shacl` crate](https://crates.io/crates/shacl) — the engine pgRDF wraps.
- <span class="material-symbols-outlined">school</span> Knublauch & Kontokostas, *Validating RDF Data* — book on SHACL by the spec editors.
- <span class="material-symbols-outlined">mic</span> **Audio companion** — five episodes covering the validation pillar (see [Training](/v0.5/training#audio-companion)).

</div>
