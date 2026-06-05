import { expect, test } from "@playwright/test";

import { createBoardFromDashboard, deleteBoardByUrl } from "./helpers/boards";
import {
  getE2eCredentials,
  getSecondaryE2eCredentials,
  signIn,
} from "./helpers/auth";
import { COLLABORATION_E2E_TIMEOUT_MS } from "./helpers/timeouts";

const ownerCredentials = getE2eCredentials();
const secondaryCredentials = getSecondaryE2eCredentials();

test.describe("board members", () => {
  test.skip(
    !ownerCredentials || !secondaryCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL/PASSWORD and PLAYWRIGHT_SECONDARY_EMAIL/PASSWORD to run board members E2E tests.",
  );

  test("invites, updates, and removes a board member", async ({ browser }) => {
    test.setTimeout(COLLABORATION_E2E_TIMEOUT_MS);

    if (!ownerCredentials || !secondaryCredentials) {
      throw new Error("Missing Playwright test credentials.");
    }

    const ownerContext = await browser.newContext();
    const secondaryContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    const secondaryPage = await secondaryContext.newPage();
    const uniqueSuffix = Date.now().toString(36);
    const boardTitle = `E2E Members Board ${uniqueSuffix}`;
    let boardUrl: string | null = null;

    try {
      await signIn(ownerPage, ownerCredentials);
      await expect(ownerPage).toHaveURL(/\/dashboard$/);

      const boardLink = await createBoardFromDashboard(ownerPage, boardTitle);

      await boardLink.click();
      await expect(ownerPage).toHaveURL(/\/boards\//);
      boardUrl = ownerPage.url();

      await ownerPage
        .getByRole("button", {
          name: "Board actions",
        })
        .click();
      await ownerPage
        .getByRole("menuitem", {
          name: "Manage members",
        })
        .click();

      const membersDialog = ownerPage.getByRole("dialog", {
        name: "Board members",
      });

      await expect(membersDialog).toBeVisible();
      await membersDialog.getByLabel("Email").fill(secondaryCredentials.email);
      await membersDialog
        .getByRole("button", {
          name: "Invite",
        })
        .click();

      const secondaryMemberRow = membersDialog.getByRole("listitem").filter({
        hasText: secondaryCredentials.email,
      });

      await expect(secondaryMemberRow).toBeVisible();
      await secondaryMemberRow.locator("select").selectOption("admin");
      await expect(secondaryMemberRow.locator("select")).toHaveValue("admin");
      await secondaryMemberRow.locator("select").selectOption("member");
      await expect(secondaryMemberRow.locator("select")).toHaveValue("member");

      await signIn(secondaryPage, secondaryCredentials);
      await expect(secondaryPage).toHaveURL(/\/dashboard$/);
      await secondaryPage
        .getByRole("link", {
          name: new RegExp(boardTitle),
        })
        .click();
      await expect(secondaryPage).toHaveURL(/\/boards\//);
      await expect(
        secondaryPage.getByRole("heading", {
          name: boardTitle,
        }),
      ).toBeVisible();

      await secondaryMemberRow.getByLabel("Remove member").click();

      const removeDialog = ownerPage.getByRole("alertdialog", {
        name: "Remove board member",
      });

      await expect(removeDialog).toBeVisible();
      await removeDialog
        .getByRole("button", {
          name: "Remove member",
        })
        .click();
      await expect(secondaryMemberRow).toHaveCount(0);
      await expect(secondaryPage).toHaveURL(/\/dashboard$/, {
        timeout: 10_000,
      });
    } finally {
      if (boardUrl) {
        await deleteBoardByUrl(ownerCredentials, boardUrl);
      }

      await ownerContext.close();
      await secondaryContext.close();
    }
  });

  test("syncs dashboard board access without refresh", async ({ browser }) => {
    test.setTimeout(COLLABORATION_E2E_TIMEOUT_MS);

    if (!ownerCredentials || !secondaryCredentials) {
      throw new Error("Missing Playwright test credentials.");
    }

    const ownerContext = await browser.newContext();
    const secondaryContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    const secondaryPage = await secondaryContext.newPage();
    const uniqueSuffix = Date.now().toString(36);
    const boardTitle = `E2E Dashboard Realtime Board ${uniqueSuffix}`;
    let boardUrl: string | null = null;

    try {
      await signIn(ownerPage, ownerCredentials);
      await expect(ownerPage).toHaveURL(/\/dashboard$/);

      const boardLink = await createBoardFromDashboard(ownerPage, boardTitle);

      await boardLink.click();
      await expect(ownerPage).toHaveURL(/\/boards\//);
      boardUrl = ownerPage.url();

      await signIn(secondaryPage, secondaryCredentials);
      await expect(secondaryPage).toHaveURL(/\/dashboard$/);
      await expect(
        secondaryPage.getByTestId("dashboard-realtime-status"),
      ).toHaveText("connected", {
        timeout: 15_000,
      });

      const secondaryBoardLink = secondaryPage.getByRole("link", {
        name: new RegExp(boardTitle),
      });

      await expect(secondaryBoardLink).toHaveCount(0);

      await ownerPage
        .getByRole("button", {
          name: "Board actions",
        })
        .click();
      await ownerPage
        .getByRole("menuitem", {
          name: "Manage members",
        })
        .click();

      const membersDialog = ownerPage.getByRole("dialog", {
        name: "Board members",
      });

      await expect(membersDialog).toBeVisible();
      await membersDialog.getByLabel("Email").fill(secondaryCredentials.email);
      await membersDialog
        .getByRole("button", {
          name: "Invite",
        })
        .click();

      await expect(secondaryBoardLink).toBeVisible({
        timeout: 15_000,
      });

      const secondaryMemberRow = membersDialog.getByRole("listitem").filter({
        hasText: secondaryCredentials.email,
      });

      await secondaryMemberRow.getByLabel("Remove member").click();

      const removeDialog = ownerPage.getByRole("alertdialog", {
        name: "Remove board member",
      });

      await expect(removeDialog).toBeVisible();
      await removeDialog
        .getByRole("button", {
          name: "Remove member",
        })
        .click();

      await expect(secondaryBoardLink).toHaveCount(0, {
        timeout: 15_000,
      });
    } finally {
      if (boardUrl) {
        await deleteBoardByUrl(ownerCredentials, boardUrl);
      }

      await ownerContext.close();
      await secondaryContext.close();
    }
  });
});
