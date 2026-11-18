import { defineConfig, devices } from "@playwright/test";

/**
 * Layout-only end-to-end checks that need a real browser (bounding boxes,
 * zoom, overflow). Unit/behaviour tests stay in vitest; this config is
 * deliberately small and only runs what lives under e2e/.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
