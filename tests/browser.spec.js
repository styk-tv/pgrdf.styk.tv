// @ts-check
const { test, expect } = require('@playwright/test');

// ────────────────────────────────────────────────────────────────────────
// Root landing — sidebar doc layout, no splash, "Introduction" content
// ────────────────────────────────────────────────────────────────────────

test.describe('Root landing (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the Introduction heading at root', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('Introduction');
  });

  test('renders the "At a glance" critical-details header', async ({ page }) => {
    const block = page.locator('.custom-block.info', { hasText: 'At a glance' });
    await expect(block).toBeVisible();
    await expect(block.getByText('Apache-2.0', { exact: true })).toBeVisible();
    await expect(block.getByText('Latest release')).toBeVisible();
    await expect(block.getByText('14 · 15 · 16 · 17')).toBeVisible();
  });

  test('renders the pgRDF logo next to the At-a-glance block (two-column)', async ({ page }) => {
    const grid = page.locator('.glance-grid');
    await expect(grid).toBeVisible();
    const logo = grid.locator('img[alt="pgRDF logo"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /pgRDF-logo\.v0\.5\.960\.png$/);
    // Side-by-side at desktop width: the logo's left edge sits to the
    // right of the "At a glance" block's left edge.
    await page.setViewportSize({ width: 1280, height: 800 });
    const textBox = await grid.locator('.glance-text').boundingBox();
    const logoBox = await grid.locator('.glance-logo').boundingBox();
    expect(logoBox.x).toBeGreaterThan(textBox.x + textBox.width * 0.5);
  });

  test('logo asset (scaled + original) are reachable', async ({ request }) => {
    const r1 = await request.get('/pgRDF-logo.v0.5.960.png');
    expect(r1.status()).toBe(200);
    expect(r1.headers()['content-type']).toMatch(/png/);
    const r2 = await request.get('/pgRDF-logo.v0.5.png');
    expect(r2.status()).toBe(200);
  });

  test('left sidebar exposes Getting started + all four pillars', async ({ page }) => {
    await expect(page.getByText('Getting started')).toBeVisible();
    await expect(page.getByText('Pillar 1 — Semantic storage')).toBeVisible();
    await expect(page.getByText('Pillar 2 — Semantic query (SPARQL 1.1)')).toBeVisible();
    await expect(page.getByText('Pillar 3 — Materialization (OWL 2 RL)')).toBeVisible();
    await expect(page.getByText('Pillar 4 — Validation (SHACL Core)')).toBeVisible();
  });

  test('no hero/splash — content starts with an H1, not a hero CTA', async ({ page }) => {
    // VitePress home layout uses .VPHero. Doc layout does not.
    await expect(page.locator('.VPHero')).toHaveCount(0);
  });

  test('explains the four engines in a table', async ({ page }) => {
    await expect(page.locator('text=Storage').first()).toBeVisible();
    await expect(page.locator('text=SPARQL').first()).toBeVisible();
    await expect(page.locator('text=Inference').first()).toBeVisible();
    await expect(page.locator('text=Validation').first()).toBeVisible();
  });

  test('has the README-style sections — why / audience / get the bits', async ({ page }) => {
    await expect(page.locator('h2:has-text("Why pgRDF")')).toBeVisible();
    await expect(page.locator('h2:has-text("Audience")')).toBeVisible();
    await expect(page.locator('h2:has-text("Get the bits")')).toBeVisible();
  });

  test('promotes releases prominently in the page body', async ({ page }) => {
    // Restrict to .vp-doc (body content), excluding nav/footer where
    // links may exist but be visually collapsed in dropdowns.
    const body = page.locator('.vp-doc');
    await expect(body.locator('a[href="https://github.com/styk-tv/pgRDF/releases"]').first()).toBeVisible();
    await expect(body.locator('a[href="https://crates.io/crates/pgrdf"]').first()).toBeVisible();
  });

  test('next-step CTA points at the four pillars', async ({ page }) => {
    const cta = page.locator('a:has-text("the four pillars")').last();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/v0\.5\/pillars/);
  });
});

// ────────────────────────────────────────────────────────────────────────
// SEO / Open Graph / structured data
// ────────────────────────────────────────────────────────────────────────

test.describe('SEO + Open Graph', () => {
  test('has a descriptive title + meta description', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/pgRDF/);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc).toMatch(/PostgreSQL/i);
    expect(desc).toMatch(/SPARQL/i);
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/');
    const ogType  = await page.locator('meta[property="og:type"]').getAttribute('content');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc  = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogUrl   = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogType).toBe('website');
    expect(ogTitle).toMatch(/pgRDF/);
    expect(ogDesc).toBeTruthy();
    expect(ogUrl).toBe('https://pgrdf.styk.tv');
    expect(ogImage).toMatch(/og-image\.svg$/);
  });

  test('has Twitter card tags', async ({ page }) => {
    await page.goto('/');
    const card  = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const image = await page.locator('meta[name="twitter:image"]').getAttribute('content');
    expect(card).toBe('summary_large_image');
    expect(image).toMatch(/og-image\.svg$/);
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/');
    const canon = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canon).toBe('https://pgrdf.styk.tv/');
  });

  test('emits JSON-LD structured data with SoftwareApplication', async ({ page }) => {
    await page.goto('/');
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toBeTruthy();
    const parsed = JSON.parse(ld);
    const graph = parsed['@graph'] || [parsed];
    const sw = graph.find(x => x['@type'] === 'SoftwareApplication');
    expect(sw).toBeTruthy();
    expect(sw.name).toBe('pgRDF');
    expect(sw.codeRepository).toBe('https://github.com/styk-tv/pgRDF');
    expect(sw.programmingLanguage).toBe('Rust');
  });

  test('og-image asset is reachable', async ({ request }) => {
    const res = await request.get('/og-image.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/svg/);
  });

  test('logo asset is reachable', async ({ request }) => {
    const res = await request.get('/logo.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/svg/);
  });

  test('sitemap is reachable', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<urlset/);
  });

  test('robots.txt is reachable', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Sitemap:/i);
  });
});

// ────────────────────────────────────────────────────────────────────────
// v0.5 sub-pages
// ────────────────────────────────────────────────────────────────────────

test.describe('v0.5 sub-pages', () => {
  test('the four pillars page is reachable', async ({ page }) => {
    await page.goto('/v0.5/pillars');
    await expect(page.locator('h1').first()).toContainText('four pillars');
  });

  test('pillar 1 storage overview is reachable', async ({ page }) => {
    await page.goto('/v0.5/storage/');
    await expect(page.locator('h1').first()).toContainText('Pillar 1');
  });

  test('feature page (BGP joins) is reachable with example SQL', async ({ page }) => {
    await page.goto('/v0.5/query/bgp-joins');
    await expect(page.locator('h1').first()).toContainText('BGP joins');
    await expect(page.locator('pre code').first()).toContainText('pgrdf.sparql');
  });

  test('inference overview is reachable', async ({ page }) => {
    await page.goto('/v0.5/inference/');
    await expect(page.locator('h1').first()).toContainText('Pillar 3');
  });

  test('validation overview is reachable', async ({ page }) => {
    await page.goto('/v0.5/validation/');
    await expect(page.locator('h1').first()).toContainText('Pillar 4');
  });

  test('top-level nav exposes the Releases dropdown', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Releases').first()).toBeVisible();
  });

  test('lifecycle UDF overview is reachable', async ({ page }) => {
    await page.goto('/v0.5/storage/lifecycle');
    await expect(page.locator('h1').first()).toContainText('Graph lifecycle UDFs');
    await expect(page.locator('text=drop_graph').first()).toBeVisible();
    await expect(page.locator('text=clear_graph').first()).toBeVisible();
    await expect(page.locator('text=copy_graph').first()).toBeVisible();
    await expect(page.locator('text=move_graph').first()).toBeVisible();
  });

  test('drop_graph page is reachable with stable-prefix table', async ({ page }) => {
    await page.goto('/v0.5/storage/drop-graph');
    await expect(page.locator('h1').first()).toContainText('drop_graph');
    await expect(page.locator('text=cannot drop default partition')).toBeVisible();
  });

  test('clear_graph page is reachable', async ({ page }) => {
    await page.goto('/v0.5/storage/clear-graph');
    await expect(page.locator('h1').first()).toContainText('clear_graph');
  });

  test('copy_graph page is reachable', async ({ page }) => {
    await page.goto('/v0.5/storage/copy-graph');
    await expect(page.locator('h1').first()).toContainText('copy_graph');
  });

  test('move_graph page is reachable', async ({ page }) => {
    await page.goto('/v0.5/storage/move-graph');
    await expect(page.locator('h1').first()).toContainText('move_graph');
  });

  test('GRAPH clause page documents both literal-IRI and variable forms', async ({ page }) => {
    await page.goto('/v0.5/query/graph-clause');
    await expect(page.getByRole('heading', { name: 'Literal-IRI form' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Variable form' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Composition with OPTIONAL / UNION / MINUS' })).toBeVisible();
  });

  test('SPARQL UPDATE page lists all six write forms + lifecycle algebra', async ({ page }) => {
    await page.goto('/v0.5/query/update');
    await expect(page.locator('h1').first()).toContainText('SPARQL UPDATE');
    await expect(page.getByRole('heading', { name: /INSERT DATA/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /DELETE DATA/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /pattern-driven/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /atomic modify/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /scoped variants/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Lifecycle algebra/ })).toBeVisible();
  });

  test('roadmap page reflects shipped UPDATE + future CONSTRUCT / paths', async ({ page }) => {
    await page.goto('/v0.5/query/roadmap');
    await expect(page.locator('text=Phase C').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Phase D — CONSTRUCT' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Property paths' })).toBeVisible();
  });

  test('At-a-glance callout reflects v0.4.3', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('.custom-block.info', { hasText: 'At a glance' });
    await expect(block.getByText(/v0\.4\.3/)).toBeVisible();
    // Phase D / CONSTRUCT is referenced as in-flight on main.
    await expect(block.getByText(/Phase D/)).toBeVisible();
  });

  test('Material Symbols stylesheet is loaded with subsetted icon list', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('link[href*="fonts.googleapis.com/css2"][href*="Material+Symbols"]').getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/icon_names=/);
    // Sanity-check that a few critical glyphs are in the subset.
    expect(href).toMatch(/groups/);
    expect(href).toMatch(/rocket_launch/);
    expect(href).toMatch(/check_circle/);
    expect(href).toMatch(/storage/);
  });

  test('Persona list on root uses Material Symbols icons', async ({ page }) => {
    await page.goto('/');
    // Each persona row contains an inline span.material-symbols-outlined.
    const icons = page.locator('.vp-doc .material-symbols-outlined');
    await expect(icons.first()).toBeVisible();
    // At least 5 (5 personas) + 1 (At-a-glance section may have one).
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('Roadmap status markers use rocket_launch + check_circle', async ({ page }) => {
    await page.goto('/v0.5/query/roadmap');
    await expect(page.locator('.material-symbols-outlined.icon-orange').first()).toBeVisible();
    await expect(page.locator('.material-symbols-outlined.icon-green').first()).toBeVisible();
  });

  test('Pillar overview headings carry a header icon', async ({ page }) => {
    for (const url of ['/v0.5/storage/', '/v0.5/query/', '/v0.5/inference/', '/v0.5/validation/']) {
      await page.goto(url);
      await expect(page.locator('h1 .material-symbols-outlined.icon-blue').first()).toBeVisible();
    }
  });

  test('Iconography reference page documents the vocabulary', async ({ page }) => {
    await page.goto('/v0.5/iconography');
    await expect(page.locator('h1').first()).toContainText('Iconography');
    // Scope to the main content area — sidebar group titles also render as <h3>.
    const main = page.locator('.vp-doc').first();
    await expect(main.getByRole('heading', { level: 3, name: 'Pillars' })).toBeVisible();
    await expect(main.getByRole('heading', { level: 3, name: 'Personas' })).toBeVisible();
    await expect(main.getByRole('heading', { level: 3, name: 'Lifecycle UDFs' })).toBeVisible();
    await expect(main.getByRole('heading', { level: 2, name: 'Adding a new icon' })).toBeVisible();
  });

  test('Audience list on root uses icon-as-bullet markers (no disc + grown icons)', async ({ page }) => {
    await page.goto('/');
    const group = page.locator('.icon-bullets').first();
    await expect(group).toBeVisible();
    // Default disc bullets should be suppressed inside the icon-bullets group.
    const liStyle = await group.locator('ul li').first().evaluate(el => getComputedStyle(el.parentElement).listStyleType);
    expect(liStyle).toBe('none');
  });

  test('Storage pillar features list is icon-bulleted', async ({ page }) => {
    await page.goto('/v0.5/storage/');
    const group = page.locator('.icon-bullets').first();
    await expect(group).toBeVisible();
    // Each list item carries an icon as its first child.
    const itemCount = await group.locator('ul li').count();
    expect(itemCount).toBeGreaterThanOrEqual(9);
  });

  test('Lifecycle table has an icon column per UDF', async ({ page }) => {
    await page.goto('/v0.5/storage/lifecycle');
    const table = page.locator('table').first();
    // delete_forever icon adjacent to drop_graph row
    await expect(table.getByText('delete_forever').first()).toBeVisible();
    await expect(table.getByText('layers_clear').first()).toBeVisible();
    await expect(table.getByText('content_copy').first()).toBeVisible();
    await expect(table.getByText('swap_horiz').first()).toBeVisible();
  });

  test('Sidebar surfaces pillar icons via CSS ::before content', async ({ page }) => {
    await page.goto('/');
    // The ::before content rule keys off the link href.
    const storageLink = page.locator('.VPSidebarItem a.link[href$="/v0.5/storage/"]').first();
    await expect(storageLink).toBeVisible();
    const before = await storageLink.locator('.text').evaluate(el =>
      window.getComputedStyle(el, '::before').content
    );
    expect(before).toMatch(/storage/);
  });

  test('CONSTRUCT page documents Phase D shipping surface', async ({ page }) => {
    await page.goto('/v0.5/query/construct');
    await expect(page.locator('h1').first()).toContainText('CONSTRUCT');
    await expect(page.getByText(/In flight/i).first()).toBeVisible();
    await expect(page.getByText(/Variable substitution/i).first()).toBeVisible();
    await expect(page.getByText(/Blank-node templates/i).first()).toBeVisible();
    await expect(page.getByText(/WHERE-shorthand/i).first()).toBeVisible();
  });

  test('Training landing page enumerates pillars + audio companion', async ({ page }) => {
    await page.goto('/v0.5/training');
    await expect(page.locator('h1').first()).toContainText('Training');
    const main = page.locator('.vp-doc').first();
    await expect(main.getByRole('heading', { level: 2, name: /Audio companion/i })).toBeVisible();
    await expect(main.getByText(/Apache-2.0/i).first()).toBeVisible();
    await expect(main.getByText(/Kokoro/i).first()).toBeVisible();
  });

  test('ChapterPlayer renders, loads manifest, and plays the test episode', async ({ page }) => {
    await page.goto('/v0.5/training');
    const player = page.locator('.chapter-player');
    await expect(player).toBeVisible();
    // Manifest-driven chapter name resolves.
    await expect(player.locator('.cp-chapter')).toContainText('Materialization');
    // Six episodes listed: 1 available + 5 pending.
    await expect(player.locator('.cp-list li')).toHaveCount(6);
    await expect(player.locator('.cp-list li.pending')).toHaveCount(5);
    // The available episode is the first list entry and is active.
    await expect(player.locator('.cp-list li').first()).toHaveClass(/active/);
    // Position label reflects "1 of 6 — <title>".
    await expect(player.locator('.cp-position')).toContainText('1 of 6');
  });

  test('ChapterPlayer test audio asset is reachable + correct type', async ({ request }) => {
    const res = await request.get('/audio/pgrdf-inference-index.ogg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/ogg|octet-stream/);
    const m = await request.get('/audio/manifest.json');
    expect(m.status()).toBe(200);
    const json = await m.json();
    expect(json.chapters.inference.episodes.length).toBe(6);
  });

  test('ChapterPlayer actually plays audio on Play click', async ({ page }) => {
    await page.goto('/v0.5/training');
    const player = page.locator('.chapter-player');
    await expect(player).toBeVisible();
    await player.getByRole('button', { name: /Play/ }).click();
    // The <audio> element should be advancing currentTime.
    await page.waitForTimeout(1200);
    const t = await player.locator('audio').evaluate(a => a.currentTime);
    expect(t).toBeGreaterThan(0);
  });

  test('All five pillar overview pages have a Training section', async ({ page }) => {
    for (const url of [
      '/v0.5/storage/',
      '/v0.5/query/',
      '/v0.5/inference/',
      '/v0.5/validation/',
      '/v0.5/operations/',
    ]) {
      await page.goto(url);
      const main = page.locator('.vp-doc').first();
      await expect(main.getByRole('heading', { level: 2, name: /Training/ })).toBeVisible();
      await expect(main.getByText(/Audio companion/i).first()).toBeVisible();
    }
  });

  test('At-a-glance callout references CONSTRUCT landing on main', async ({ page }) => {
    await page.goto('/');
    const block = page.locator('.custom-block.info', { hasText: 'At a glance' });
    await expect(block.getByText(/CONSTRUCT/i)).toBeVisible();
    await expect(block.getByText(/Training/i)).toBeVisible();
  });
});
