import { type ReactNode } from "react";

import { AppContainer } from "@/shared/ui/app-container";

interface Props {
  actions?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export const RouteState = ({ actions, description, eyebrow, title }: Props) => (
  <main className="min-h-svh bg-muted/30 p-6">
    <AppContainer className="min-h-[calc(100svh-3rem)] justify-center">
      <section className="w-full max-w-xl space-y-5">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-medium text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex flex-col gap-2 sm:flex-row">{actions}</div>
        ) : null}
      </section>
    </AppContainer>
  </main>
);
