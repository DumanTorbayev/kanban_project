"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type PropsWithChildren } from "react";

import { cn } from "@workspace/ui/lib/utils";

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}>;

export const Modal = ({
  children,
  className,
  description,
  onOpenChange,
  open,
  title,
}: Props) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
      >
        <div className="space-y-1.5 pr-8">
          <Dialog.Title className="text-base font-semibold">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          ) : null}
        </div>
        {children}
        <Dialog.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none">
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
