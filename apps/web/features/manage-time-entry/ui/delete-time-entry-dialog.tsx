"use client";

import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { ConfirmDialog } from "@workspace/ui/components/confirm-dialog";

import { useDeleteTimeEntryDialog } from "../model/use-delete-time-entry-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntry: CompletedTimeEntry;
}

export const DeleteTimeEntryDialog = ({
  onOpenChange,
  open,
  timeEntry,
}: Props) => {
  const { error, handleConfirm, isPending } = useDeleteTimeEntryDialog({
    onOpenChange,
    timeEntry,
  });

  return (
    <ConfirmDialog
      confirmLabel="Delete entry"
      description="This completed time session will be permanently removed from the report."
      error={error}
      isPending={isPending}
      onConfirm={handleConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete time entry?"
    />
  );
};
