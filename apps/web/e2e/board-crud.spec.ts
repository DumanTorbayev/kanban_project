import { expect, test } from "@playwright/test";

import { createBoardFromDashboard } from "./helpers/boards";
import { getE2eCredentials, signIn } from "./helpers/auth";
import { AUTHENTICATED_E2E_TIMEOUT_MS } from "./helpers/timeouts";

const e2eCredentials = getE2eCredentials();

test.describe("board CRUD", () => {
  test.skip(
    !e2eCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run board CRUD E2E tests.",
  );

  test("creates, renames, and deletes a board", async ({ page }) => {
    test.setTimeout(AUTHENTICATED_E2E_TIMEOUT_MS);

    if (!e2eCredentials) {
      throw new Error("Missing Playwright test credentials.");
    }

    const uniqueSuffix = Date.now().toString(36);
    const boardTitle = `E2E Board ${uniqueSuffix}`;
    const renamedBoardTitle = `E2E Board Renamed ${uniqueSuffix}`;

    await signIn(page, e2eCredentials);
    await expect(page).toHaveURL(/\/dashboard$/, {
      timeout: 15_000,
    });

    const boardLink = await createBoardFromDashboard(page, boardTitle);
    await boardLink.click();

    await expect(page).toHaveURL(/\/boards\//);
    await expect(
      page.getByRole("heading", {
        name: boardTitle,
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Board actions",
      })
      .click();
    await page
      .getByRole("menuitem", {
        name: "Rename board",
      })
      .click();

    const renameDialog = page.getByRole("dialog", {
      name: "Rename board",
    });

    await expect(renameDialog).toBeVisible();
    await renameDialog.getByLabel("Title").fill(renamedBoardTitle);
    await renameDialog
      .getByRole("button", {
        name: "Save changes",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: renamedBoardTitle,
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Board actions",
      })
      .click();
    await page
      .getByRole("menuitem", {
        name: "Delete board",
      })
      .click();

    const deleteDialog = page.getByRole("alertdialog", {
      name: "Delete board?",
    });

    await expect(deleteDialog).toBeVisible();
    await deleteDialog
      .getByRole("button", {
        name: "Delete board",
      })
      .click();

    await expect(page).toHaveURL(/\/dashboard$/, {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("link", {
        name: new RegExp(renamedBoardTitle),
      }),
    ).toHaveCount(0);
  });
});
