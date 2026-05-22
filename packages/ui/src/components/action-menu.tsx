"use client";

import { MoreHorizontal } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { type ReactNode, Fragment } from "react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separatorBefore?: boolean;
  onSelect: () => void;
};

interface Props {
  label: string;
  items: ActionMenuItem[];
  align?: "start" | "center" | "end";
  className?: string;
}

export const ActionMenu = ({
  align = "end",
  className,
  items,
  label,
}: Props) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <Button
        aria-label={label}
        className={className}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        className="z-50 min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=top]:animate-in data-[side=top]:slide-in-from-bottom-1"
        sideOffset={6}
      >
        {items.map((item, index) => (
          <Fragment key={item.label + "-" + index}>
            {item.separatorBefore ? (
              <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
            ) : null}
            <DropdownMenu.Item
              className={cn(
                "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
                item.variant === "destructive" &&
                  "text-destructive focus:bg-destructive/10 focus:text-destructive",
              )}
              disabled={item.disabled}
              onSelect={() => item.onSelect()}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenu.Item>
          </Fragment>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
