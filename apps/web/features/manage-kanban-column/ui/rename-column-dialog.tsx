"use client";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { useRenameColumnDialog } from "../model/use-rename-column-dialog";

interface Props {
  column: KanbanColumnWithCards;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RenameColumnDialog = ({ column, onOpenChange, open }: Props) => {
  const { error, handleCancel, handleSubmit, isPending } =
    useRenameColumnDialog({
      column,
      onOpenChange,
    });

  return (
    <Modal
      description="Rename this workflow stage for everyone on the board."
      onOpenChange={onOpenChange}
      open={open}
      title="Rename column"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={column.title}
            name="title"
            required
            type="text"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isPending}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
