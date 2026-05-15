// @ts-check
const { test, expect } = require('@playwright/test');

test('home page renders the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('pgRDF');
  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
});

test('introduction page is reachable', async ({ page }) => {
  await page.goto('/v0.4/introduction');
  await expect(page.locator('h1').first()).toContainText('Introduction');
});

test('pillar 1 storage overview is reachable', async ({ page }) => {
  await page.goto('/v0.4/storage/');
  await expect(page.locator('h1').first()).toContainText('Pillar 1');
});

test('sidebar exposes all four pillars', async ({ page }) => {
  await page.goto('/v0.4/introduction');
  await expect(page.getByText('Pillar 1 — Semantic storage')).toBeVisible();
  await expect(page.getByText('Pillar 2 — Semantic query (SPARQL 1.1)')).toBeVisible();
  await expect(page.getByText('Pillar 3 — Materialization (OWL 2 RL)')).toBeVisible();
  await expect(page.getByText('Pillar 4 — Validation (SHACL Core)')).toBeVisible();
});
