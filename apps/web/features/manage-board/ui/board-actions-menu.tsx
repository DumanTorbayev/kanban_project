"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type BoardMember } from "@/entities/board-member/model/types";
import { type BoardDetails } from "@/entities/board/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

const RenameBoardDialog = dynamic(() =>
  import("./rename-board-dialog").then((module) => module.RenameBoardDialog),
);
const DeleteBoardDialog = dynamic(() =>
  import("./delete-board-dialog").then((module) => module.DeleteBoardDialog),
);
const BoardMembersDialog = dynamic(() =>
  import("@/features/manage-board-members/ui/board-members-dialog").then(
    (module) => module.BoardMembersDialog,
  ),
);

interface Props {
  board: BoardDetails;
  currentUserId: string;
  members: BoardMember[];
}

export const BoardActionsMenu = ({ board, currentUserId, members }: Props) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
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
            icon: <Users aria-hidden="true" />,
            label: "Manage members",
            onSelect: () => setMembersOpen(true),
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
      {membersOpen ? (
        <BoardMembersDialog
          boardId={board.id}
          currentUserId={currentUserId}
          initialMembers={members}
          onOpenChange={setMembersOpen}
          open={membersOpen}
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
