"use client";

import { type KanbanCard } from "@/entities/kanban/model/types";
import { ConfirmDialog } from "@workspace/ui/components/confirm-dialog";

import { useDeleteCardDialog } from "../model/use-delete-card-dialog";

interface Props {
  card: KanbanCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteCardDialog = ({ card, onOpenChange, open }: Props) => {
  const { error, handleConfirm, isPending } = useDeleteCardDialog({
    card,
    onOpenChange,
  });

  return (
    <ConfirmDialog
      confirmLabel="Delete card"
      description="This card will be permanently removed from the board."
      error={error}
      isPending={isPending}
      onConfirm={handleConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete card?"
    />
  );
};
