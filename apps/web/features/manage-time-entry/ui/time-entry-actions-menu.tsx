"use client";

import { Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { ActionMenu } from "@workspace/ui/components/action-menu";

const EditTimeEntryDialog = dynamic(() =>
  import("./edit-time-entry-dialog").then(
    (module) => module.EditTimeEntryDialog,
  ),
);
const DeleteTimeEntryDialog = dynamic(() =>
  import("./delete-time-entry-dialog").then(
    (module) => module.DeleteTimeEntryDialog,
  ),
);

interface Props {
  disabled?: boolean;
  timeEntry: CompletedTimeEntry;
}

export const TimeEntryActionsMenu = ({ disabled, timeEntry }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ActionMenu
        items={[
          {
            disabled,
            icon: <Pencil aria-hidden="true" />,
            label: "Edit entry",
            onSelect: () => setEditOpen(true),
          },
          {
            disabled,
            icon: <Trash2 aria-hidden="true" />,
            label: "Delete entry",
            onSelect: () => setDeleteOpen(true),
            separatorBefore: true,
            variant: "destructive",
          },
        ]}
        label="Time entry actions"
      />
      {editOpen ? (
        <EditTimeEntryDialog
          onOpenChange={setEditOpen}
          open={editOpen}
          timeEntry={timeEntry}
        />
      ) : null}
      {deleteOpen ? (
        <DeleteTimeEntryDialog
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
          timeEntry={timeEntry}
        />
      ) : null}
    </>
  );
};
