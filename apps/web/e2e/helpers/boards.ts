import { expect, type Locator, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import { type E2eCredentials } from "./auth";

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

const getBoardIdFromUrl = (boardUrl: string): string => {
  const { pathname } = new URL(boardUrl);
  const boardId = pathname.split("/").filter(Boolean).at(-1);

  if (!boardId) {
    throw new Error(`Could not parse board id from ${boardUrl}.`);
  }

  return boardId;
};

export const deleteBoardByUrl = async (
  credentials: E2eCredentials,
  boardUrl: string,
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase env variables for E2E cleanup.");
  }

  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (signInError) {
    throw new Error(signInError.message);
  }

  const { error: deleteError } = await supabase
    .from("boards")
    .delete()
    .eq("id", getBoardIdFromUrl(boardUrl));

  await supabase.auth.signOut();

  if (deleteError) {
    throw new Error(deleteError.message);
  }
};
