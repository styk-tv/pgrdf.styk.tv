---
title: Validate — the conformance verb
description: Validate checks a graph against a SHACL shapes graph and returns a W3C sh:ValidationReport as JSONB. Backed by pgrdf.validate — mode 'native' is W3C SHACL Core 25/25; mode 'pgrdf' is the shipped, authoritative SHACL-SPARQL gate; mode 'sparql' reaches the rudof engine but is E-014-caveated. Single-threaded, sized to fit.
---

# <span class="material-symbols-outlined icon-blue">verified</span>Validate

> Check a graph against a **SHACL shapes graph** and get back a W3C
> `sh:ValidationReport` as JSONB — data you can persist, alert on, or
> gate ingestion with.

## What it is

Validate takes a data graph and a shapes graph and reports every
constraint violation as structured rows. The report is the same shape
the W3C SHACL spec defines, returned as JSONB so it composes with
regular SQL.

## How you run it

```sql
pgrdf.validate(data_graph BIGINT, shapes_graph BIGINT, mode TEXT DEFAULT 'native') → JSONB
```

The `mode` selects the engine:

- **`'native'`** (default) — W3C **SHACL Core 25/25**, the rudof SHACL
  Core engine, with the W3C manifest runner wired into CI.
- **`'pgrdf'`** — the **shipped**, **authoritative** SHACL-SPARQL gate.
  The pgRDF-native handler evaluates SHACL-SPARQL custom constraints
  (`sh:sparql` / `sh:select` / `sh:ask`) **directly against the
  hexastore** — no N-Triples rehydrate — and returns the correct W3C
  verdict.
- **`'sparql'`** — routes SHACL-SPARQL constraints to the rudof
  `SparqlEngine`. The dispatch reaches the engine, but it carries an
  open correctness caveat (**E-014**): it returns the wrong verdict on
  common topologies, so it is **not a trusted gate** — use `'pgrdf'`
  for SHACL-SPARQL correctness.

See [Pillar 4 — Validation](/v0.6/validation/) and
[SHACL-SPARQL](/v0.6/validation/shacl-sparql).

## Where it sits in a chain

**After [Reason](/v0.6/process/reason) or [Seal](/v0.6/process/seal),
before [Query](/v0.6/process/query) or as an ingestion gate.**
Validating *after* Reason checks the entailed closure, not just the
asserted triples — often what you actually want.

::: warning Scaling class — single-threaded
Like [Reason](/v0.6/process/reason), Validate runs on one backend over
a graph **sized to your box**. It is the other half of the
single-threaded class that the
[carve pattern](/v0.6/process/pattern-carve) exists to serve.
:::

## Example

```sql
-- data graph 1, shapes graph 2
SELECT pgrdf.validate(1, 2);
--  → {"conforms": true, "results": []}
```

## See also

- [Pillar 4 — Validation](/v0.6/validation/) — SHACL Core components and the report shape.
- [Report as data](/v0.6/validation/report-as-data) — querying the JSONB report.
- [Pattern: Load → Validate → Query](/v0.6/process/pattern-validate) — the validation-gate chain.
