"use client";

import { Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type BoardDetails } from "@/entities/board/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

const RenameBoardDialog = dynamic(() =>
  import("./rename-board-dialog").then((module) => module.RenameBoardDialog),
);
const DeleteBoardDialog = dynamic(() =>
  import("./delete-board-dialog").then((module) => module.DeleteBoardDialog),
);

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
      {renameOpen ? (
        <RenameBoardDialog
          board={board}
          onOpenChange={setRenameOpen}
          open={renameOpen}
        />
      ) : null}
      {deleteOpen ? (
        <DeleteBoardDialog
          board={board}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
        />
      ) : null}
    </>
  );
};
