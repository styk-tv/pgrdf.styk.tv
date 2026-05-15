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
