# pgrdf.styk.tv

Documentation site for **[pgRDF](https://github.com/styk-tv/pgRDF)** —
the Rust-native PostgreSQL extension for RDF, SPARQL, SHACL and OWL
2 RL reasoning.

Live site: **<https://pgrdf.styk.tv>**

## Stack

VitePress (Vue static site generator) + mermaid + anime.js,
deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Local development

```bash
npm install        # install vitepress + plugins
npm run docs:dev   # http://localhost:5173, hot reload
```

## Local build

```bash
npm run docs:build      # outputs docs/.vitepress/dist
npm run docs:preview    # serve the built site locally
```

## Tests

```bash
npx playwright install --with-deps   # one-time
npm test                              # full Playwright suite
```

## Layout

```
docs/
├── .vitepress/
│  ├── config.mts                # site config — nav, sidebar, head meta
│  └── theme/                    # custom theme overrides
├── public/                      # static assets — CNAME, robots, logo
└── v0.5/                        # current version content
   ├── introduction.md
   ├── storage/{...}             # Pillar 1 — RDF storage in Postgres
   ├── query/{...}               # Pillar 2 — SPARQL 1.1
   ├── inference/{...}           # Pillar 3 — OWL 2 RL materialization
   ├── validation/{...}          # Pillar 4 — SHACL Core
   └── operations/{...}          # operator surface
```

Content is seeded from
[`styk-tv/pgRDF/specs/SPEC.pgRDF.v0.5.FEATURES.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.v0.5.FEATURES.md);
the spec is canonical, this site is the reader-friendly surface.

## Domain

`docs/public/CNAME` pins the served domain to `pgrdf.styk.tv`. DNS
side: `pgrdf` CNAME → `styk-tv.github.io` in the `styk.tv` zone.

## License

Apache-2.0. Copyright 2026 Peter Styk &lt;peter@styk.tv&gt;.
