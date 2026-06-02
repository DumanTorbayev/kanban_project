import { type ComponentProps } from "react";

import { cn } from "@workspace/ui/lib/utils";

interface Props extends Omit<ComponentProps<"div">, "children"> {
  children?: never;
}

export const Skeleton = ({ className, ...props }: Props) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
);
