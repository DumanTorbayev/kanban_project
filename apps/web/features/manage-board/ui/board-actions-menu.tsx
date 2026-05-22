"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { type BoardDetails } from "@/entities/board/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

import { DeleteBoardDialog } from "./delete-board-dialog";
import { RenameBoardDialog } from "./rename-board-dialog";

interface Props {
  board: BoardDetails;
}

export const BoardActionsMenu = ({ board }: Props) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ActionMenu
        items={[
          {
            icon: <Pencil aria-hidden="true" />,
            label: "Rename board",
            onSelect: () => setRenameOpen(true),
          },
          {
            icon: <Trash2 aria-hidden="true" />,
            label: "Delete board",
            onSelect: () => setDeleteOpen(true),
            separatorBefore: true,
            variant: "destructive",
          },
        ]}
        label="Board actions"
      />
      <RenameBoardDialog
        board={board}
        onOpenChange={setRenameOpen}
        open={renameOpen}
      />
      <DeleteBoardDialog
        board={board}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
    </>
  );
};
