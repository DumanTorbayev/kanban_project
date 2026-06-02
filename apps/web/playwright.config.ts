import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const isCi = Boolean(process.env.CI);
const webServerCommand = isCi
  ? "pnpm exec next start --hostname 127.0.0.1"
  : "pnpm dev --hostname 127.0.0.1";

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  forbidOnly: isCi,
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
  reporter: isCi
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
  retries: isCi ? 2 : 0,
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: webServerCommand,
    reuseExistingServer: !isCi,
    timeout: 120000,
    url: baseURL,
  },
  workers: isCi ? 1 : undefined,
});
