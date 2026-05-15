// @ts-check
const { test, expect } = require('@playwright/test');

// ────────────────────────────────────────────────────────────────────────
// Landing page — content, SEO, OG, structured data, release promotion
// ────────────────────────────────────────────────────────────────────────

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero renders with the brand', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('pgRDF');
    await expect(page).toHaveTitle(/pgRDF/);
  });

  test('exposes the four pillar tiles', async ({ page }) => {
    await expect(page.locator('text=Pillar 1 — Semantic storage')).toBeVisible();
    await expect(page.locator('text=Pillar 2 — Semantic query')).toBeVisible();
    await expect(page.locator('text=Pillar 3 — Materialization')).toBeVisible();
    await expect(page.locator('text=Pillar 4 — Validation')).toBeVisible();
  });

  test('has README-style sections — what / why / who / releases', async ({ page }) => {
    await expect(page.locator('h2:has-text("What is pgRDF?")')).toBeVisible();
    await expect(page.locator('h2:has-text("Why does it exist?")')).toBeVisible();
    await expect(page.locator('h2:has-text("Who is this for?")')).toBeVisible();
    await expect(page.locator('h2:has-text("Latest release")')).toBeVisible();
  });

  test('promotes releases prominently', async ({ page }) => {
    await expect(page.locator('a[href="https://github.com/styk-tv/pgRDF/releases"]').first()).toBeVisible();
    await expect(page.locator('a[href="https://crates.io/crates/pgrdf"]').first()).toBeVisible();
  });

  test('primary CTA points at v0.5', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Get started/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/v0\.5\/introduction/);
  });
});

// ────────────────────────────────────────────────────────────────────────
// SEO / Open Graph / structured data — checked against rendered HTML head
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

  test('og-image asset is reachable', async ({ page, request }) => {
    const res = await request.get('/og-image.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/svg/);
  });

  test('logo asset is reachable', async ({ page, request }) => {
    const res = await request.get('/logo.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/svg/);
  });

  test('sitemap is reachable', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<urlset/);
    expect(body).toMatch(/v0\.5\/introduction/);
  });

  test('robots.txt is reachable', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Sitemap:/i);
  });
});

// ────────────────────────────────────────────────────────────────────────
// Navigation / v0.5 focus
// ────────────────────────────────────────────────────────────────────────

test.describe('v0.5 focus', () => {
  test('introduction page is reachable and explains the four engines', async ({ page }) => {
    await page.goto('/v0.5/introduction');
    await expect(page.locator('h1').first()).toContainText('Introduction');
    await expect(page.locator('text=The four engines')).toBeVisible();
  });

  test('pillar 1 storage overview is reachable', async ({ page }) => {
    await page.goto('/v0.5/storage/');
    await expect(page.locator('h1').first()).toContainText('Pillar 1');
  });

  test('sidebar exposes all four pillars', async ({ page }) => {
    await page.goto('/v0.5/introduction');
    await expect(page.getByText('Pillar 1 — Semantic storage')).toBeVisible();
    await expect(page.getByText('Pillar 2 — Semantic query (SPARQL 1.1)')).toBeVisible();
    await expect(page.getByText('Pillar 3 — Materialization (OWL 2 RL)')).toBeVisible();
    await expect(page.getByText('Pillar 4 — Validation (SHACL Core)')).toBeVisible();
  });

  test('top-level nav exposes the Releases dropdown', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Releases').first()).toBeVisible();
  });

  test('feature page (BGP joins) is reachable with example SQL', async ({ page }) => {
    await page.goto('/v0.5/query/bgp-joins');
    await expect(page.locator('h1').first()).toContainText('BGP joins');
    await expect(page.locator('pre code').first()).toContainText('pgrdf.sparql');
  });
});
