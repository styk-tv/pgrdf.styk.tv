// @ts-check
const { defineConfig } = require('@playwright/test');

// Allow running against the live deployment with TARGET=live (or
// PLAYWRIGHT_BASE_URL=...). Default is the local dev server.
const LIVE   = process.env.TARGET === 'live' || !!process.env.PLAYWRIGHT_BASE_URL;
const BASE   = process.env.PLAYWRIGHT_BASE_URL || (LIVE ? 'https://pgrdf.styk.tv' : 'http://localhost:5173');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  // Only spawn the dev server when we're aiming at the local URL.
  ...(LIVE ? {} : {
    webServer: {
      command: 'npm run docs:dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  }),
});
