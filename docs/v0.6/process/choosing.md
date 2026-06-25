---
title: Choosing a process — the decision guide
description: Pick the right pgRDF chain from two questions — what output you need (query, inference, validation) and whether the graph fits one backend. A decision table mapping goal and scale onto the four patterns.
---

# <span class="material-symbols-outlined icon-blue">fact_check</span>Choosing a process

> Two questions decide your chain: **what output do you need**, and
> **does the graph fit one backend** for the single-threaded steps.

## The two questions

1. **What is the output?**
   - Just read the data → **Query**.
   - Read the *entailed* data → **Reason**, then Query.
   - A conformance verdict → **Validate** (optionally after Reason).
2. **Does the graph fit your box for Reason / Validate?**
   - Yes → a simple head→tail chain, no carving.
   - No (the source is larger than one backend can close over) → add
     the [carve waist](/v0.6/process/carve).

## Decision table

| Your goal | Graph fits the box | Graph larger than the box |
|---|---|---|
| **Query only** | [Load → Query](/v0.6/process/pattern-load-query) | [Load → Query](/v0.6/process/pattern-load-query) — Query is not the single-threaded constraint; the full 8.2 B graph is queryable in place |
| **Inferred query** | [Load → Reason → Query](/v0.6/process/pattern-reason) | [Ingest → Carve → Reason](/v0.6/process/pattern-carve) |
| **Validation gate** | [Load → Validate → Query](/v0.6/process/pattern-validate) | [Ingest → Carve → Reason](/v0.6/process/pattern-carve) → Validate the slice |
| **Reason + validate** | [Load → Reason → Validate → Query](/v0.6/process/pattern-validate) | [Ingest → Carve → Reason](/v0.6/process/pattern-carve) → Validate the slice |

## The one rule that drives it

[Import](/v0.6/process/import) and [Seal](/v0.6/process/seal) scale to
the full [8.2-billion-triple ceiling](/v0.6/scale/);
[Reason](/v0.6/process/reason) and [Validate](/v0.6/process/validate)
are single-threaded and run on a graph sized to your box. So:

> **Query at any scale. Reason and validate at *your* scale** — carve
> down to a slice when the source is bigger than one backend can hold.

The [carve waist](/v0.6/process/carve) is on the
[roadmap](/v0.6/roadmap/) (C1–C4); until it lands, the
[carve pattern](/v0.6/process/pattern-carve) shows the manual path.

## See also

- [Building a chain](/v0.6/process/building-a-chain) — the design method once you've chosen.
- [Overview](/v0.6/process/) — the verbs and the two scaling classes.
