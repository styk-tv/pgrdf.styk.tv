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
});
