"use client";

import { Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

const RenameColumnDialog = dynamic(() =>
  import("./rename-column-dialog").then((module) => module.RenameColumnDialog),
);
const DeleteColumnDialog = dynamic(() =>
  import("./delete-column-dialog").then((module) => module.DeleteColumnDialog),
);

interface Props {
  column: KanbanColumnWithCards;
  disabled?: boolean;
}

export const ColumnActionsMenu = ({ column, disabled }: Props) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ActionMenu
        items={[
          {
            disabled,
            icon: <Pencil aria-hidden="true" />,
            label: "Rename column",
            onSelect: () => setRenameOpen(true),
          },
          {
            disabled,
            icon: <Trash2 aria-hidden="true" />,
            label: "Delete column",
            onSelect: () => setDeleteOpen(true),
            separatorBefore: true,
            variant: "destructive",
          },
        ]}
        label={"Column actions for " + column.title}
      />
      {renameOpen ? (
        <RenameColumnDialog
          column={column}
          onOpenChange={setRenameOpen}
          open={renameOpen}
        />
      ) : null}
      {deleteOpen ? (
        <DeleteColumnDialog
          column={column}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
        />
      ) : null}
    </>
  );
};
