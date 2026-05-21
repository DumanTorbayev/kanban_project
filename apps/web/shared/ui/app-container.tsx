import { type ReactNode } from "react";

import { cn } from "@workspace/ui/lib/utils";

type AppContainerProps = {
  children: ReactNode;
  className?: string;
};

export function AppContainer({ children, className }: AppContainerProps) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-[100rem] flex-col gap-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
