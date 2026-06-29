import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build --prefix frontend && NODE_ENV=production DATA_DIR=./e2e-data/data UPLOADS_DIR=./e2e-data/uploads FRONTEND_DIST=./frontend/dist node backend/src/server.js',
    port: 3001,
    cwd: process.cwd(),
    reuseExistingServer: !process.env.CI,
  },
});
