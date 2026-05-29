import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  outputDir: "./test-results",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  reporter: process.env.CI
    ? [
        ["github"],
        [
          "html",
          {
            open: "never",
          },
        ],
      ]
    : [
        ["list"],
        [
          "html",
          {
            open: "never",
          },
        ],
      ],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
});
