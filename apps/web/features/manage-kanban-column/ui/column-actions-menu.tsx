"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

import { DeleteColumnDialog } from "./delete-column-dialog";
import { RenameColumnDialog } from "./rename-column-dialog";

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
        label="Column actions"
      />
      <RenameColumnDialog
        column={column}
        onOpenChange={setRenameOpen}
        open={renameOpen}
      />
      <DeleteColumnDialog
        column={column}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
    </>
  );
};
