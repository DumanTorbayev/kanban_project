import { type PropsWithChildren } from "react";

import { cn } from "@workspace/ui/lib/utils";

export const AppContainer = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <section
    className={cn("mx-auto flex w-full max-w-400 flex-col gap-6", className)}
  >
    {children}
  </section>
);
