import { expect, type Locator, type Page } from "@playwright/test";

import { type E2eCredentials } from "./auth";

type SupabasePasswordGrantResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  msg?: string;
};

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

const getResponseText = async (response: Response) => {
  const responseText = await response.text();

  return responseText || response.statusText;
};

const getSupabaseAccessToken = async (
  credentials: E2eCredentials,
  supabaseUrl: string,
  supabasePublishableKey: string,
) => {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      headers: {
        apikey: supabasePublishableKey,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(await getResponseText(response));
  }

  const authData = (await response.json()) as SupabasePasswordGrantResponse;

  if (!authData.access_token) {
    throw new Error(
      authData.error_description ??
        authData.error ??
        authData.msg ??
        "Supabase did not return an access token.",
    );
  }

  return authData.access_token;
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

  const accessToken = await getSupabaseAccessToken(
    credentials,
    supabaseUrl,
    supabasePublishableKey,
  );
  const boardId = encodeURIComponent(getBoardIdFromUrl(boardUrl));
  const deleteResponse = await fetch(
    `${supabaseUrl}/rest/v1/boards?id=eq.${boardId}`,
    {
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
      method: "DELETE",
    },
  );

  if (!deleteResponse.ok) {
    throw new Error(await getResponseText(deleteResponse));
  }
};
