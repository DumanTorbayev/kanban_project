"use client";

import { type BoardDetails } from "@/entities/board/model/types";
import { ConfirmDialog } from "@workspace/ui/components/confirm-dialog";

import { useDeleteBoardDialog } from "../model/use-delete-board-dialog";

interface Props {
  board: BoardDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteBoardDialog = ({ board, onOpenChange, open }: Props) => {
  const { error, handleConfirm, isPending } = useDeleteBoardDialog({
    board,
  });

  return (
    <ConfirmDialog
      confirmLabel="Delete board"
      description="This board, its columns, and all cards inside it will be permanently removed."
      error={error}
      isPending={isPending}
      onConfirm={handleConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete board?"
    />
  );
};
