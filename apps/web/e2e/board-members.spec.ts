import { expect, test } from "@playwright/test";

import {
  getE2eCredentials,
  getSecondaryE2eCredentials,
  signIn,
} from "./helpers/auth";

const ownerCredentials = getE2eCredentials();
const secondaryCredentials = getSecondaryE2eCredentials();

test.describe("board members", () => {
  test.skip(
    !ownerCredentials || !secondaryCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL/PASSWORD and PLAYWRIGHT_SECONDARY_EMAIL/PASSWORD to run board members E2E tests.",
  );

  test("invites, updates, and removes a board member", async ({ browser }) => {
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

      await ownerPage.getByLabel("Board title").fill(boardTitle);
      await ownerPage
        .getByRole("button", {
          name: "Create board",
        })
        .click();
      await ownerPage
        .getByRole("link", {
          name: new RegExp(boardTitle),
        })
        .click();
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
        await ownerPage.goto(boardUrl);
        await ownerPage
          .getByRole("button", {
            name: "Board actions",
          })
          .click();
        await ownerPage
          .getByRole("menuitem", {
            name: "Delete board",
          })
          .click();

        const deleteBoardDialog = ownerPage.getByRole("alertdialog", {
          name: "Delete board?",
        });

        await expect(deleteBoardDialog).toBeVisible();
        await deleteBoardDialog
          .getByRole("button", {
            name: "Delete board",
          })
          .click();
      }

      await ownerContext.close();
      await secondaryContext.close();
    }
  });

  test("syncs dashboard board access without refresh", async ({ browser }) => {
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

      await ownerPage.getByLabel("Board title").fill(boardTitle);
      await ownerPage
        .getByRole("button", {
          name: "Create board",
        })
        .click();
      await ownerPage
        .getByRole("link", {
          name: new RegExp(boardTitle),
        })
        .click();
      await expect(ownerPage).toHaveURL(/\/boards\//);
      boardUrl = ownerPage.url();

      await signIn(secondaryPage, secondaryCredentials);
      await expect(secondaryPage).toHaveURL(/\/dashboard$/);

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
        timeout: 10_000,
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
        timeout: 10_000,
      });
    } finally {
      if (boardUrl) {
        await ownerPage.goto(boardUrl);
        await ownerPage
          .getByRole("button", {
            name: "Board actions",
          })
          .click();
        await ownerPage
          .getByRole("menuitem", {
            name: "Delete board",
          })
          .click();

        const deleteBoardDialog = ownerPage.getByRole("alertdialog", {
          name: "Delete board?",
        });

        await expect(deleteBoardDialog).toBeVisible();
        await deleteBoardDialog
          .getByRole("button", {
            name: "Delete board",
          })
          .click();
      }

      await ownerContext.close();
      await secondaryContext.close();
    }
  });
});
