"use client";

import * as React from "react";
import { type PropsWithChildren } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { ThemeHotkey } from "./theme-hotkey";

type BaseProps = Omit<
  React.ComponentProps<typeof NextThemesProvider>,
  "children"
>;

const ThemeProvider = ({
  children,
  ...props
}: PropsWithChildren<BaseProps>) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
    {...props}
  >
    <ThemeHotkey />
    {children}
  </NextThemesProvider>
);

export { ThemeProvider };
