"use client";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { FormErrorMessage } from "@/shared/ui/form-error-message";
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
  const errorId = "rename-column-error";

  return (
    <Modal
      description="Rename this workflow stage for everyone on the board."
      isDismissDisabled={isPending}
      onOpenChange={onOpenChange}
      open={open}
      title="Rename column"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <FormErrorMessage id={errorId}>{error}</FormErrorMessage>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Title</span>
          <input
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={column.title}
            disabled={isPending}
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
