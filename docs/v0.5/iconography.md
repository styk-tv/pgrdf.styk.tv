---
title: Iconography — the visual vocabulary
description: pgRDF site icon vocabulary. One icon per concept, used consistently across pages, callouts, tables, and navigation.
---

# <span class="material-symbols-outlined icon-blue">bolt</span>Iconography

> The site uses a small set of [Material Symbols Outlined](https://fonts.google.com/icons)
> glyphs as a **visual vocabulary**. One icon per concept, reused
> consistently. The font is subsetted to only the glyphs in this
> table — adding a new icon to a page requires extending the
> subset in `docs/.vitepress/config.mts`.

## How icons are used

- **As bullets** — when a list item leads with an icon, the icon
  *replaces* the disc marker and grows a touch. Wrap the list in
  `<div class="icon-bullets">`. See the audience list on the
  [Introduction](/) page for the canonical example.
- **As section markers** — pillar overview pages carry one
  brand-blue icon in the H1; the roadmap page uses
  rocket_launch (orange) and check_circle (green) as status
  markers.
- **As table cells** — the [lifecycle UDFs overview](/v0.5/storage/lifecycle)
  surfaces a distinct icon per UDF so the table scans visually.
- **In navigation** — the five pillar overview entries in the
  sidebar carry the same blue icons used in their H1s.

## Size variants

| Class | Size | Use case |
|---|---|---|
| `.icon-xs` | 1.0 em | Inline in dense tables |
| `.icon-sm` | 1.2 em | Default — inline body text |
| `.icon-md` | 1.5 em | Bullet list markers |
| `.icon-lg` | 1.9 em | Hero callouts |
| `.icon-xl` | 2.6 em | Page-level decoration |

The bullet-marker mode (`<div class="icon-bullets">`) sizes the
icon at 1.6 em automatically — no need to apply `.icon-md`.

## Color accents

Used sparingly, only when the icon is making a real signal.

| Class | Color | Used for |
|---|---|---|
| `.icon-blue` | PostgreSQL elephant | Pillar headers; primary brand accent |
| `.icon-green` | RDF data green | "Shipped" status markers |
| `.icon-orange` | Heads-up amber | Forward-edge status, in-flight callouts |
| *(no class)* | inherits text color | Default — body, neutral lists |

## The vocabulary

### Pillars

| Icon | Glyph | Concept |
|---|---|---|
| <span class="material-symbols-outlined icon-blue">storage</span> | `storage` | Pillar 1 — Semantic storage |
| <span class="material-symbols-outlined icon-blue">search</span> | `search` | Pillar 2 — Semantic query (SPARQL) |
| <span class="material-symbols-outlined icon-blue">psychology</span> | `psychology` | Pillar 3 — Materialization (OWL 2 RL) |
| <span class="material-symbols-outlined icon-blue">verified</span> | `verified` | Pillar 4 — Validation (SHACL Core) |
| <span class="material-symbols-outlined">build</span> | `build` | Operations |

### Status

| Icon | Glyph | Concept |
|---|---|---|
| <span class="material-symbols-outlined icon-green">check_circle</span> | `check_circle` | Shipped on `main` |
| <span class="material-symbols-outlined icon-orange">rocket_launch</span> | `rocket_launch` | Forward edge / in flight |
| <span class="material-symbols-outlined">info</span> | `info` | Inline metadata callout |

### Personas

| Icon | Glyph | Concept |
|---|---|---|
| <span class="material-symbols-outlined">groups</span> | `groups` | Project managers |
| <span class="material-symbols-outlined">query_stats</span> | `query_stats` | Data scientists |
| <span class="material-symbols-outlined">school</span> | `school` | Ontologists |
| <span class="material-symbols-outlined">code</span> | `code` | Backend engineers |
| <span class="material-symbols-outlined">settings</span> | `settings` | Operators |

### Concepts

| Icon | Glyph | Concept |
|---|---|---|
| <span class="material-symbols-outlined">description</span> | `description` | Turtle ingest (file or string) |
| <span class="material-symbols-outlined">account_tree</span> | `account_tree` | Named graphs / IRI tree / hexastore |
| <span class="material-symbols-outlined">bolt</span> | `bolt` | Speed / cache / hot path |
| <span class="material-symbols-outlined">hub</span> | `hub` | Composition (OPTIONAL / UNION / MINUS) |
| <span class="material-symbols-outlined">fact_check</span> | `fact_check` | Validation report |

### Lifecycle UDFs

| Icon | Glyph | UDF |
|---|---|---|
| <span class="material-symbols-outlined">delete_forever</span> | `delete_forever` | `pgrdf.drop_graph` |
| <span class="material-symbols-outlined">layers_clear</span> | `layers_clear` | `pgrdf.clear_graph` |
| <span class="material-symbols-outlined">content_copy</span> | `content_copy` | `pgrdf.copy_graph` |
| <span class="material-symbols-outlined">swap_horiz</span> | `swap_horiz` | `pgrdf.move_graph` |

## Adding a new icon

1. Pick a glyph from <https://fonts.google.com/icons>.
2. Append the glyph name to the comma-separated `icon_names=…`
   list in `docs/.vitepress/config.mts`.
3. Add a row to the appropriate vocabulary table above.
4. If it's a recurring concept, sketch a one-line "used for"
   semantics — this is the rule that keeps future authors from
   re-using the same glyph for two distinct ideas.
5. If it's a sidebar overview icon, wire the `::before` rule in
   `docs/.vitepress/theme/custom.css`.

## Anti-patterns

- **Don't decorate every line.** The icon must pull weight —
  navigation, status differentiation, or table-row identity.
  Body prose is icon-free.
- **Don't introduce a new glyph when an existing one fits.**
  Vocabulary consistency beats novelty.
- **Don't colour-accent without a reason.** Default is inherit.
  Use a colour only for status (green / orange) or pillar
  identity (blue).
