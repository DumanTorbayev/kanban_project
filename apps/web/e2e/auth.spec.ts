import { expect, test } from "@playwright/test";

import { getE2eCredentials, signIn } from "./helpers/auth";
import { AUTHENTICATED_E2E_TIMEOUT_MS } from "./helpers/timeouts";

const e2eCredentials = getE2eCredentials();

test.describe("auth routing", () => {
  test("redirects anonymous users from protected dashboard to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/auth\/login\?redirectTo=%2Fdashboard/);
    await expect(
      page.getByRole("heading", {
        name: "Sign in",
      }),
    ).toBeVisible();
    await expect(page.locator('input[name="redirectTo"]')).toHaveValue(
      "/dashboard",
    );
  });
});

test.describe("authenticated auth flow", () => {
  test.skip(
    !e2eCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run authenticated E2E tests.",
  );

  test("signs in with a test account and signs out", async ({ page }) => {
    test.setTimeout(AUTHENTICATED_E2E_TIMEOUT_MS);

    if (!e2eCredentials) {
      throw new Error("Missing Playwright test credentials.");
    }

    await signIn(page, e2eCredentials);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", {
        exact: true,
        level: 1,
        name: "Dashboard",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(`Signed in as ${e2eCredentials.email}`),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Sign out",
      })
      .click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(
      page.getByRole("heading", {
        name: "Sign in",
      }),
    ).toBeVisible();
  });
});
