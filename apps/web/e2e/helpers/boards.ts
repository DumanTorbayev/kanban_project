import { expect, type Locator, type Page } from "@playwright/test";

const boardHrefPattern =
  /\/boards\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createBoardFromDashboard = async (
  page: Page,
  boardTitle: string,
): Promise<Locator> => {
  await page.getByLabel("Board title").fill(boardTitle);
  await page
    .getByRole("button", {
      name: "Create board",
    })
    .click();

  const boardLink = page.getByRole("link", {
    name: new RegExp(boardTitle),
  });

  await expect(boardLink).toBeVisible();
  await expect(boardLink).toHaveAttribute("href", boardHrefPattern);

  return boardLink;
};
