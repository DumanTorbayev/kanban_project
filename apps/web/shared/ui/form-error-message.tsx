import { type PropsWithChildren } from "react";

import { cn } from "@workspace/ui/lib/utils";

type Props = PropsWithChildren<{
  className?: string;
  id?: string;
}>;

export const FormErrorMessage = ({ children, className, id }: Props) => (
  <p
    className={cn(
      "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
      className,
    )}
    id={id}
    role="alert"
  >
    {children}
  </p>
);
