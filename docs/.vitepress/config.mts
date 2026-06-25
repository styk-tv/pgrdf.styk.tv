import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const SITE_URL  = 'https://pgrdf.styk.tv'
const SITE_NAME = 'pgRDF'
const SITE_DESC = 'PostgreSQL extension for RDF, SPARQL, SHACL and OWL 2 RL reasoning — written in Rust. Load Turtle, query SPARQL, validate SHACL, materialize OWL 2 RL inferences. All inside Postgres.'

export default withMermaid(defineConfig({
  title: SITE_NAME,
  titleTemplate: ':title — pgRDF',
  description: SITE_DESC,
  lang: 'en-GB',

  head: [
    // Favicon & app icon
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#336791' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],

    // Material Symbols (Outlined) — subsetted to only the icons we
    // reference, so the woff2 stays a few KB. Add a glyph here, use
    // it sparingly in pages.
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300,0..1,-25..0&icon_names=account_tree,auto_stories,bolt,build,check_circle,code,content_copy,delete_forever,description,fact_check,graphic_eq,groups,hub,info,layers_clear,mic,pause,play_arrow,play_circle,psychology,query_stats,rocket_launch,schedule,school,search,settings,skip_next,skip_previous,storage,swap_horiz,verified&display=swap' }],

    // Theme + canonical
    ['meta', { name: 'theme-color', content: '#336791' }],
    ['meta', { name: 'author', content: 'Peter Styk' }],
    ['link', { rel: 'canonical', href: SITE_URL + '/' }],

    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:title', content: 'pgRDF — Semantic web inside PostgreSQL' }],
    ['meta', { property: 'og:description', content: SITE_DESC }],
    ['meta', { property: 'og:url', content: SITE_URL }],
    ['meta', { property: 'og:image', content: SITE_URL + '/og-image.svg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'pgRDF — Semantic web inside PostgreSQL' }],
    ['meta', { property: 'og:locale', content: 'en_GB' }],

    // Twitter
    ['meta', { name: 'twitter:card',        content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title',       content: 'pgRDF — Semantic web inside PostgreSQL' }],
    ['meta', { name: 'twitter:description', content: SITE_DESC }],
    ['meta', { name: 'twitter:image',       content: SITE_URL + '/og-image.svg' }],
    ['meta', { name: 'twitter:image:alt',   content: 'pgRDF — Semantic web inside PostgreSQL' }],

    // SEO hints
    ['meta', { name: 'keywords', content: 'PostgreSQL, RDF, SPARQL, SHACL, OWL, OWL 2 RL, reasoning, knowledge graph, semantic web, Rust, pgrx, Turtle, ontology, dictionary encoding, hexastore, named graphs, triplestore, graph database' }],
    ['meta', { name: 'robots',   content: 'index, follow, max-image-preview:large' }],

    // Structured data — SoftwareApplication + WebSite
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          'name': 'pgRDF',
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Linux, macOS, Windows (via Postgres container)',
          'description': SITE_DESC,
          'url': SITE_URL,
          'downloadUrl': 'https://github.com/styk-tv/pgRDF/releases',
          'codeRepository': 'https://github.com/styk-tv/pgRDF',
          'license': 'https://opensource.org/license/mit',
          'programmingLanguage': 'Rust',
          'softwareRequirements': 'PostgreSQL 14, 15, 16, or 17',
          'author': { '@type': 'Person', 'name': 'Peter Styk', 'email': 'peter@styk.tv' },
          'sameAs': [
            'https://github.com/styk-tv/pgRDF',
            'https://crates.io/crates/pgrdf',
          ],
        },
        {
          '@type': 'WebSite',
          'name': SITE_NAME,
          'url': SITE_URL,
          'description': SITE_DESC,
          'inLanguage': 'en-GB',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': { '@type': 'EntryPoint', 'urlTemplate': SITE_URL + '/?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    })],
  ],

  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: SITE_URL },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'pgRDF',

    nav: [
      {
        text: 'Docs',
        items: [
          { text: 'Introduction',     link: '/' },
          { text: 'The four pillars', link: '/v0.6/pillars' },
        ],
      },
      {
        text: 'Releases',
        items: [
          { text: 'GitHub releases (v0.6.14)', link: 'https://github.com/styk-tv/pgRDF/releases/tag/v0.6.14' },
          { text: 'CHANGELOG',                 link: 'https://github.com/styk-tv/pgRDF/blob/main/CHANGELOG.md' },
          { text: 'crates.io',                 link: 'https://crates.io/crates/pgrdf' },
        ],
      },
      { text: 'Archive (v0.5)', link: '/v0.5/pillars' },
      { text: 'GitHub', link: 'https://github.com/styk-tv/pgRDF' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Introduction',     link: '/' },
            { text: 'The four pillars', link: '/v0.6/pillars' },
          ],
        },
        {
          text: 'Pillar 1 — Semantic storage',
          collapsed: false,
          items: [
            { text: 'Overview',                                link: '/v0.6/storage/' },
            { text: 'Load Turtle from disk',                   link: '/v0.6/storage/load-turtle' },
            { text: 'Native staged bulk loader',               link: '/v0.6/storage/staged-loader' },
            { text: 'Inline Turtle ingest',                    link: '/v0.6/storage/parse-turtle' },
            { text: 'Verbose ingest statistics',               link: '/v0.6/storage/verbose-stats' },
            { text: 'Per-graph LIST partitions',               link: '/v0.6/storage/graph-partitions' },
            { text: 'Named graphs (IRI ↔ id)',                 link: '/v0.6/storage/named-graphs' },
            { text: 'Hexastore + dictionary',                  link: '/v0.6/storage/hexastore' },
            { text: 'Term types — literals, lang, blank, lists', link: '/v0.6/storage/term-types' },
            { text: 'Bulk ingest',                             link: '/v0.6/storage/bulk-ingest' },
            { text: 'Shared-memory dictionary cache',          link: '/v0.6/storage/shmem-cache' },
            {
              text: 'Graph lifecycle UDFs',
              collapsed: true,
              items: [
                { text: 'Overview',     link: '/v0.6/storage/lifecycle' },
                { text: 'drop_graph',   link: '/v0.6/storage/drop-graph' },
                { text: 'clear_graph',  link: '/v0.6/storage/clear-graph' },
                { text: 'copy_graph',   link: '/v0.6/storage/copy-graph' },
                { text: 'move_graph',   link: '/v0.6/storage/move-graph' },
              ],
            },
          ],
        },
        {
          text: 'Pillar 2 — Semantic query (SPARQL 1.1)',
          collapsed: false,
          items: [
            { text: 'Overview',                          link: '/v0.6/query/' },
            { text: 'BGP joins',                         link: '/v0.6/query/bgp-joins' },
            { text: 'FILTER',                            link: '/v0.6/query/filter' },
            { text: 'OPTIONAL',                          link: '/v0.6/query/optional' },
            { text: 'UNION',                             link: '/v0.6/query/union' },
            { text: 'MINUS',                             link: '/v0.6/query/minus' },
            { text: 'Aggregates + GROUP BY',             link: '/v0.6/query/aggregates' },
            { text: 'HAVING',                            link: '/v0.6/query/having' },
            { text: 'BIND',                              link: '/v0.6/query/bind' },
            { text: 'Solution modifiers',                link: '/v0.6/query/modifiers' },
            { text: 'ASK',                               link: '/v0.6/query/ask' },
            { text: 'GRAPH <iri> { … }',                 link: '/v0.6/query/graph-clause' },
            { text: 'SPARQL UPDATE',                     link: '/v0.6/query/update' },
            { text: 'CONSTRUCT',                         link: '/v0.6/query/construct' },
            { text: 'Property paths',                    link: '/v0.6/query/property-paths' },
            { text: 'sparql_parse — inspect without executing', link: '/v0.6/query/sparql-parse' },
            { text: 'Error-message contract',            link: '/v0.6/query/error-contract' },
            { text: "Forward edge — what's next",        link: '/v0.6/query/roadmap' },
          ],
        },
        {
          text: 'Pillar 3 — Materialization (OWL 2 RL)',
          collapsed: false,
          items: [
            { text: 'Overview',                          link: '/v0.6/inference/' },
            { text: 'Mental model',                      link: '/v0.6/inference/mental-model' },
            { text: 'Worked example — subclass chain',   link: '/v0.6/inference/example' },
            { text: 'OWL 2 RL rule set',                 link: '/v0.6/inference/owl-rl-rules' },
            { text: 'Idempotence + operator safety',     link: '/v0.6/inference/idempotence' },
            { text: 'Reasoning profile selector',        link: '/v0.6/inference/profile-selector' },
            { text: 'Reasoning at scale',                link: '/v0.6/inference/scale' },
          ],
        },
        {
          text: 'Pillar 4 — Validation (SHACL Core)',
          collapsed: false,
          items: [
            { text: 'Overview',                          link: '/v0.6/validation/' },
            { text: 'Mental model',                      link: '/v0.6/validation/mental-model' },
            { text: 'Worked example',                    link: '/v0.6/validation/example' },
            { text: 'SHACL Core components',             link: '/v0.6/validation/shacl-components' },
            { text: 'Report as data',                    link: '/v0.6/validation/report-as-data' },
            { text: 'SHACL-SPARQL + manifest runner',    link: '/v0.6/validation/shacl-sparql' },
          ],
        },
        {
          text: 'Operations',
          collapsed: true,
          items: [
            { text: 'Overview',                          link: '/v0.6/operations/' },
            { text: 'pgrdf.stats() observability',       link: '/v0.6/operations/stats' },
            { text: 'Cache control',                     link: '/v0.6/operations/cache-control' },
            { text: 'Prepared-plan cache',               link: '/v0.6/operations/plan-cache' },
            { text: 'Compose with regular SQL',          link: '/v0.6/operations/sql-composition' },
            { text: 'Multi-version Postgres support',    link: '/v0.6/operations/multi-pg' },
            { text: 'Drop-in install',                   link: '/v0.6/operations/install' },
          ],
        },
        {
          text: 'Scale',
          collapsed: false,
          items: [
            { text: 'Scale & benchmarks',                link: '/v0.6/scale/' },
          ],
        },
        {
          text: 'Process',
          collapsed: false,
          items: [
            { text: 'Processes & flows',                 link: '/v0.6/process/' },
          ],
        },
        {
          text: 'Roadmap',
          collapsed: false,
          items: [
            { text: 'Roadmap',                           link: '/v0.6/roadmap/' },
          ],
        },
        {
          text: 'Archive (v0.5)',
          collapsed: true,
          items: [
            { text: 'The four pillars (v0.5)',           link: '/v0.5/pillars' },
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
      message: 'MIT licensed. Documentation for pgRDF — built with VitePress, served via GitHub Pages.',
      copyright: 'Copyright © 2026 Peter Styk',
    },
  },
}))
