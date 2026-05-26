"use client";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { ConfirmDialog } from "@workspace/ui/components/confirm-dialog";

import { useDeleteColumnDialog } from "../model/use-delete-column-dialog";

interface Props {
  column: KanbanColumnWithCards;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteColumnDialog = ({ column, onOpenChange, open }: Props) => {
  const { error, handleConfirm, isPending } = useDeleteColumnDialog({
    column,
    onOpenChange,
  });

  return (
    <ConfirmDialog
      confirmLabel="Delete column"
      description="This column and every card inside it will be permanently removed."
      error={error}
      isPending={isPending}
      onConfirm={handleConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete column?"
    />
  );
};
