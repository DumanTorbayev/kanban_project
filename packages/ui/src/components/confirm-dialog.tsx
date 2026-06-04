"use client";

import { AlertDialog } from "radix-ui";

import { Button } from "@workspace/ui/components/button";

interface Props {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel?: string;
  error?: string | null;
  isPending?: boolean;
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export const ConfirmDialog = ({
  confirmLabel,
  description,
  error,
  isPending = false,
  onConfirm,
  onOpenChange,
  open,
  pendingLabel = "Deleting...",
  title,
}: Props) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
        <div className="space-y-1.5">
          <AlertDialog.Title className="text-base font-semibold">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
        </div>

        {error ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialog.Cancel asChild>
            <Button disabled={isPending} type="button" variant="outline">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
