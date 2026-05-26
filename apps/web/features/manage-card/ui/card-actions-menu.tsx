"use client";

import { Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type KanbanCard } from "@/entities/kanban/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

const EditCardDialog = dynamic(() =>
  import("./edit-card-dialog").then((module) => module.EditCardDialog),
);
const DeleteCardDialog = dynamic(() =>
  import("./delete-card-dialog").then((module) => module.DeleteCardDialog),
);

interface Props {
  card: KanbanCard;
  className?: string;
  disabled?: boolean;
}

export const CardActionsMenu = ({ card, className, disabled }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ActionMenu
        className={className}
        items={[
          {
            disabled,
            icon: <Pencil aria-hidden="true" />,
            label: "Edit card",
            onSelect: () => setEditOpen(true),
          },
          {
            disabled,
            icon: <Trash2 aria-hidden="true" />,
            label: "Delete card",
            onSelect: () => setDeleteOpen(true),
            separatorBefore: true,
            variant: "destructive",
          },
        ]}
        label="Card actions"
      />
      {editOpen ? (
        <EditCardDialog
          card={card}
          onOpenChange={setEditOpen}
          open={editOpen}
        />
      ) : null}
      {deleteOpen ? (
        <DeleteCardDialog
          card={card}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
        />
      ) : null}
    </>
  );
};
