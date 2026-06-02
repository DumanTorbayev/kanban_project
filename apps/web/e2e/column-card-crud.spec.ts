import { expect, test, type Locator, type Page } from "@playwright/test";

import { createBoardFromDashboard } from "./helpers/boards";
import { getE2eCredentials, signIn } from "./helpers/auth";
import { AUTHENTICATED_E2E_TIMEOUT_MS } from "./helpers/timeouts";

const e2eCredentials = getE2eCredentials();

const renameColumnWithRetry = async ({
  page,
  renameDialog,
  title,
  trigger,
}: {
  page: Page;
  renameDialog: Locator;
  title: string;
  trigger: Locator;
}) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await trigger.click();
      await page
        .getByRole("menuitem", {
          name: "Rename column",
        })
        .click({
          timeout: 3_000,
        });
      const titleInput = renameDialog.getByLabel("Title");

      await expect(titleInput).toBeVisible({
        timeout: 3_000,
      });
      await titleInput.fill(title);
      await renameDialog
        .getByRole("button", {
          name: "Save changes",
        })
        .click({
          timeout: 3_000,
        });
      return;
    } catch {
      await page.keyboard.press("Escape").catch(() => undefined);
    }
  }

  await trigger.click();
  await page
    .getByRole("menuitem", {
      name: "Rename column",
    })
    .click();

  const titleInput = renameDialog.getByLabel("Title");

  await expect(titleInput).toBeVisible();
  await titleInput.fill(title);
  await renameDialog
    .getByRole("button", {
      name: "Save changes",
    })
    .click();
};

test.describe("column and card CRUD", () => {
  test.skip(
    !e2eCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run column/card CRUD E2E tests.",
  );

  test("creates, renames, and deletes a column and card", async ({ page }) => {
    test.setTimeout(AUTHENTICATED_E2E_TIMEOUT_MS);

    if (!e2eCredentials) {
      throw new Error("Missing Playwright test credentials.");
    }

    const uniqueSuffix = Date.now().toString(36);
    const boardTitle = `E2E Column Card Board ${uniqueSuffix}`;
    const columnTitle = `E2E Column ${uniqueSuffix}`;
    const renamedColumnTitle = `E2E Column Renamed ${uniqueSuffix}`;
    const cardTitle = `E2E Card ${uniqueSuffix}`;
    const cardDescription = `E2E Card description ${uniqueSuffix}`;
    const editedCardTitle = `E2E Card Edited ${uniqueSuffix}`;
    const editedCardDescription = `E2E Card edited description ${uniqueSuffix}`;

    await signIn(page, e2eCredentials);
    await expect(page).toHaveURL(/\/dashboard$/);

    const boardLink = await createBoardFromDashboard(page, boardTitle);

    await boardLink.click();
    await expect(page).toHaveURL(/\/boards\//);

    await page.getByLabel("Column title").fill(columnTitle);
    await page
      .getByRole("button", {
        name: "Add column",
      })
      .click();

    const columnRegion = page.getByRole("region", {
      name: `${columnTitle} column`,
    });

    await expect(columnRegion).toBeVisible();
    const renameColumnDialog = page.getByRole("dialog", {
      name: "Rename column",
    });

    await renameColumnWithRetry({
      page,
      renameDialog: renameColumnDialog,
      title: renamedColumnTitle,
      trigger: columnRegion.getByRole("button", {
        name: `Column actions for ${columnTitle}`,
      }),
    });

    const renamedColumnRegion = page.getByRole("region", {
      name: `${renamedColumnTitle} column`,
    });

    await expect(renamedColumnRegion).toBeVisible();
    await renamedColumnRegion
      .getByRole("button", {
        name: `Add card to ${renamedColumnTitle}`,
      })
      .click();

    const createCardDialog = page.getByRole("dialog", {
      name: "Create card",
    });

    await expect(createCardDialog).toBeVisible();
    await createCardDialog.getByLabel("Title").fill(cardTitle);
    await createCardDialog.getByLabel("Description").fill(cardDescription);
    await createCardDialog.getByLabel("Column").selectOption({
      label: renamedColumnTitle,
    });
    await createCardDialog
      .getByRole("button", {
        name: "Create card",
      })
      .click();

    const card = page.getByRole("article", {
      name: `Card: ${cardTitle}`,
    });

    await expect(card).toBeVisible();
    await expect(card.getByText(cardDescription)).toBeVisible();
    await page
      .getByRole("button", {
        name: `Card actions for ${cardTitle}`,
      })
      .click();
    await page
      .getByRole("menuitem", {
        name: "Edit card",
      })
      .click();

    const editCardDialog = page.getByRole("dialog", {
      name: "Edit card",
    });

    await expect(editCardDialog).toBeVisible();
    await editCardDialog.getByLabel("Title").fill(editedCardTitle);
    await editCardDialog.getByLabel("Description").fill(editedCardDescription);
    await editCardDialog
      .getByRole("button", {
        name: "Save changes",
      })
      .click();

    const editedCard = page.getByRole("article", {
      name: `Card: ${editedCardTitle}`,
    });

    await expect(editedCard).toBeVisible();
    await expect(editedCard.getByText(editedCardDescription)).toBeVisible();
    await page
      .getByRole("button", {
        name: `Card actions for ${editedCardTitle}`,
      })
      .click();
    await page
      .getByRole("menuitem", {
        name: "Delete card",
      })
      .click();

    const deleteCardDialog = page.getByRole("alertdialog", {
      name: "Delete card?",
    });

    await expect(deleteCardDialog).toBeVisible();
    await deleteCardDialog
      .getByRole("button", {
        name: "Delete card",
      })
      .click();
    await expect(deleteCardDialog).toBeHidden({
      timeout: 15_000,
    });
    await expect(editedCard).toHaveCount(0);

    await renamedColumnRegion
      .getByRole("button", {
        name: `Column actions for ${renamedColumnTitle}`,
      })
      .click();
    await page
      .getByRole("menuitem", {
        name: "Delete column",
      })
      .click();

    const deleteColumnDialog = page.getByRole("alertdialog", {
      name: "Delete column?",
    });

    await expect(deleteColumnDialog).toBeVisible();
    await deleteColumnDialog
      .getByRole("button", {
        name: "Delete column",
      })
      .click();
    await expect(deleteColumnDialog).toBeHidden({
      timeout: 15_000,
    });
    await expect(renamedColumnRegion).toHaveCount(0);

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

    const deleteBoardDialog = page.getByRole("alertdialog", {
      name: "Delete board?",
    });

    await expect(deleteBoardDialog).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/dashboard$/, {
        timeout: 15_000,
      }),
      deleteBoardDialog
        .getByRole("button", {
          name: "Delete board",
        })
        .click(),
    ]);
    await expect(
      page.getByRole("link", {
        name: new RegExp(boardTitle),
      }),
    ).toHaveCount(0);
  });
});
