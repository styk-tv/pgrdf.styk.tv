---
title: Training — learning paths + audio companion
description: Per-pillar curated learning paths for pgRDF, plus the audio podcast companion (Kokoro TTS, Apache-2.0 licensed).
---

# <span class="material-symbols-outlined icon-blue">auto_stories</span>Training

> Per-pillar learning paths, recommended background reading, and
> the **audio companion** — a 52-episode podcast graph generated
> from this documentation.

## How to use this site to learn

Each of the four pillars has a recommended path that takes you
from "I've never used this before" to "I can build a production
graph workload against it":

<div class="icon-bullets">

- <span class="material-symbols-outlined icon-blue">storage</span> [**Pillar 1 — Semantic storage**](/v0.5/storage/#training) — Turtle ingest, dictionary encoding, partitions, hexastore. Start here if you're new to RDF in Postgres.
- <span class="material-symbols-outlined icon-blue">search</span> [**Pillar 2 — Semantic query (SPARQL 1.1)**](/v0.5/query/#training) — read surface (BGP joins → OPTIONAL → aggregates) then write surface (UPDATE). Start here if you can ingest but don't yet query in SPARQL.
- <span class="material-symbols-outlined icon-blue">psychology</span> [**Pillar 3 — Materialization (OWL 2 RL)**](/v0.5/inference/#training) — what the reasoner entails, when materialisation pays off, the idempotence contract. Start here when SPARQL queries on raw assertions feel underpowered.
- <span class="material-symbols-outlined icon-blue">verified</span> [**Pillar 4 — Validation (SHACL Core)**](/v0.5/validation/#training) — shapes, constraint components, the report-as-data idiom. Start here when you need to gate or audit graph ingestion.
- <span class="material-symbols-outlined">build</span> [**Operations**](/v0.5/operations/#training) — observability, install, multi-PG support, SQL composition. Start here if you're stewarding a deployment.

</div>

## Background reading

Material not specific to pgRDF, but worth a session if you're
new to a given pillar:

| Pillar | External resource |
|---|---|
| RDF foundations | [RDF 1.1 Primer (W3C)](https://www.w3.org/TR/rdf11-primer/) |
| SPARQL | [SPARQL 1.1 Query Language (W3C)](https://www.w3.org/TR/sparql11-query/) and [Update (W3C)](https://www.w3.org/TR/sparql11-update/) |
| OWL 2 RL | [OWL 2 Web Ontology Language — Profiles (W3C)](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL) |
| SHACL | [Shapes Constraint Language (W3C)](https://www.w3.org/TR/shacl/) |
| Turtle | [RDF 1.1 Turtle (W3C)](https://www.w3.org/TR/turtle/) |
| Postgres extension model | [PostgreSQL CREATE EXTENSION](https://www.postgresql.org/docs/current/sql-createextension.html) |
| pgrx (Rust + Postgres) | [pgrx project](https://github.com/pgcentralfoundation/pgrx) |

## <span class="material-symbols-outlined">mic</span>Audio companion

> A **52-episode podcast graph** generated from this site's
> markdown via [Kokoro](https://github.com/hexgrad/kokoro) — the
> Apache-2.0 TTS model — with engineered phrase libraries, not
> page-readalouds. One podcast per documentation page. Same
> structure, ear-shaped delivery.

### What it is

Each documentation page has a corresponding podcast, structured
as a phrase library (TAG / INT / TRN / CTX / DEF / HOW / API /
EX / CAV / CMP / ROAD / REF / CLS segments) and a playback order
designed for **listening**, not page-reading. A `CREATE TABLE`
snippet on the page becomes spoken prose in the podcast: "the
dictionary table is just three columns: a bigserial primary key
called id, a text column called value that's unique, and a small
integer called term-type."

### Generation pipeline

- **Source of truth:** this site's markdown.
- **TTS engine:** Kokoro (Apache-2.0, commercial use permitted).
- **Default rendering:** English, voice `af_heart`,
  `clean` post-production chain, 24 kHz OGG @ 96 kbps.
- **Catalogue:** 52 podcasts × ~30 segments each.
- **Re-render:** atomic per-segment; the text layer (`graphs/`)
  is immutable input.

### Hosting plan

Audio assets live in their own repository so the documentation
repo stays small and clones stay fast. Per [GitHub Pages
limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits),
single files cap at 100 MB and a repo softly caps at 1 GB —
each per-segment OGG is ~50-300 KB, so the full library fits
comfortably. The docs site will reference the audio cross-origin
once the catalogue is published.

### Status

::: tip Test slice live
One episode is rendered and wired into the player below — the
**Pillar 3 (Materialization) overview**, ~4 minutes. The other
51 episodes are pending the full render fan-out; they show as
*pending* in the playlist. The player is a single audio engine:
selecting an episode stops any other, and it auto-advances to
the next available episode on finish.
:::

<ChapterPlayer chapter="inference" />

This is a deliberately small test — one chapter, one rendered
episode, native `<audio>` (no waveform / talking-head yet). The
richer chapter experience (waveform, transcript highlight,
wireface) is a separate styk.tv sub-project; this page just
proves the audio path end-to-end on the docs site.

### Licence + attribution

- **TTS model**: [Kokoro](https://github.com/hexgrad/kokoro) —
  Apache-2.0. Commercial use permitted with attribution.
- **Generated audio**: Apache-2.0 (matching pgRDF and the docs
  source).
- **Use case**: educational documentation companion. Fully within
  the [GitHub Pages acceptable use](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies)
  scope.

## See also

- [Iconography](/v0.5/iconography) — the visual vocabulary the
  site uses to differentiate concepts at a glance.
- [The four pillars](/v0.5/pillars) — quick tour of the
  capability surface.
