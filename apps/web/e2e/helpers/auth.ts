import { type Page } from "@playwright/test";

export type E2eCredentials = {
  email: string;
  password: string;
};

export const getE2eCredentials = (): E2eCredentials | null => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
  };
};

export const getSecondaryE2eCredentials = (): E2eCredentials | null => {
  const email = process.env.PLAYWRIGHT_SECONDARY_EMAIL;
  const password = process.env.PLAYWRIGHT_SECONDARY_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
  };
};

export const signIn = async (page: Page, credentials: E2eCredentials) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page
    .getByRole("button", {
      name: "Sign in",
    })
    .click();
};
