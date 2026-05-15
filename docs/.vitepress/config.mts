import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: 'pgRDF',
  description: 'PostgreSQL extension for RDF, SPARQL, SHACL and OWL 2 RL reasoning',

  head: [
    ['meta', { name: 'theme-color', content: '#336791' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'pgRDF — Semantic web inside PostgreSQL' }],
    ['meta', { property: 'og:description', content: 'PostgreSQL extension for RDF, SPARQL, SHACL and OWL 2 RL reasoning' }],
    ['meta', { property: 'og:url', content: 'https://pgrdf.styk.tv' }],
  ],

  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: 'https://pgrdf.styk.tv' },

  themeConfig: {
    siteTitle: 'pgRDF',

    nav: [
      {
        text: 'Docs',
        items: [
          { text: 'v0.4 (Current)', link: '/v0.4/introduction' },
        ],
      },
      { text: 'crates.io', link: 'https://crates.io/crates/pgrdf' },
      { text: 'GitHub', link: 'https://github.com/styk-tv/pgRDF' },
    ],

    sidebar: {
      '/v0.4/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Introduction', link: '/v0.4/introduction' },
            { text: 'The four pillars', link: '/v0.4/pillars' },
          ],
        },
        {
          text: 'Pillar 1 — Semantic storage',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/v0.4/storage/' },
            { text: 'Load Turtle from disk', link: '/v0.4/storage/load-turtle' },
            { text: 'Inline Turtle ingest', link: '/v0.4/storage/parse-turtle' },
            { text: 'Verbose ingest statistics', link: '/v0.4/storage/verbose-stats' },
            { text: 'Per-graph LIST partitions', link: '/v0.4/storage/graph-partitions' },
            { text: 'Named graphs (IRI ↔ id)', link: '/v0.4/storage/named-graphs' },
            { text: 'Hexastore + dictionary', link: '/v0.4/storage/hexastore' },
            { text: 'Term types — literals, lang, blank, lists', link: '/v0.4/storage/term-types' },
            { text: 'Bulk ingest', link: '/v0.4/storage/bulk-ingest' },
            { text: 'Shared-memory dictionary cache', link: '/v0.4/storage/shmem-cache' },
          ],
        },
        {
          text: 'Pillar 2 — Semantic query (SPARQL 1.1)',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/v0.4/query/' },
            { text: 'BGP joins', link: '/v0.4/query/bgp-joins' },
            { text: 'FILTER', link: '/v0.4/query/filter' },
            { text: 'OPTIONAL', link: '/v0.4/query/optional' },
            { text: 'UNION', link: '/v0.4/query/union' },
            { text: 'MINUS', link: '/v0.4/query/minus' },
            { text: 'Aggregates + GROUP BY', link: '/v0.4/query/aggregates' },
            { text: 'HAVING', link: '/v0.4/query/having' },
            { text: 'BIND', link: '/v0.4/query/bind' },
            { text: 'Solution modifiers', link: '/v0.4/query/modifiers' },
            { text: 'ASK', link: '/v0.4/query/ask' },
            { text: 'GRAPH <iri> { … }', link: '/v0.4/query/graph-clause' },
            { text: 'sparql_parse — inspect without executing', link: '/v0.4/query/sparql-parse' },
            { text: 'Error-message contract', link: '/v0.4/query/error-contract' },
            { text: 'Forward edge (v0.5)', link: '/v0.4/query/roadmap' },
          ],
        },
        {
          text: 'Pillar 3 — Materialization (OWL 2 RL)',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/v0.4/inference/' },
            { text: 'Mental model', link: '/v0.4/inference/mental-model' },
            { text: 'Worked example — subclass chain', link: '/v0.4/inference/example' },
            { text: 'OWL 2 RL rule set', link: '/v0.4/inference/owl-rl-rules' },
            { text: 'Idempotence + operator safety', link: '/v0.4/inference/idempotence' },
            { text: 'Forward edge — profile selector', link: '/v0.4/inference/profile-selector' },
          ],
        },
        {
          text: 'Pillar 4 — Validation (SHACL Core)',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/v0.4/validation/' },
            { text: 'Mental model', link: '/v0.4/validation/mental-model' },
            { text: 'Worked example', link: '/v0.4/validation/example' },
            { text: 'SHACL Core components', link: '/v0.4/validation/shacl-components' },
            { text: 'Report as data', link: '/v0.4/validation/report-as-data' },
            { text: 'Forward edge — SHACL-SPARQL', link: '/v0.4/validation/shacl-sparql' },
          ],
        },
        {
          text: 'Operations',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/v0.4/operations/' },
            { text: 'pgrdf.stats() observability', link: '/v0.4/operations/stats' },
            { text: 'Cache control', link: '/v0.4/operations/cache-control' },
            { text: 'Prepared-plan cache', link: '/v0.4/operations/plan-cache' },
            { text: 'Compose with regular SQL', link: '/v0.4/operations/sql-composition' },
            { text: 'Multi-version Postgres support', link: '/v0.4/operations/multi-pg' },
            { text: 'Drop-in install', link: '/v0.4/operations/install' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/styk-tv/pgRDF' },
    ],

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/styk-tv/pgrdf.styk.tv/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Apache-2.0 licensed. Documentation for pgRDF.',
      copyright: 'Copyright © 2026 Peter Styk',
    },
  },
}))
