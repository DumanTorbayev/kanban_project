"use client";

import { type KanbanCard } from "@/entities/kanban/model/types";
import { FormErrorMessage } from "@/shared/ui/form-error-message";
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { useEditCardDialog } from "../model/use-edit-card-dialog";

interface Props {
  card: KanbanCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditCardDialog = ({ card, onOpenChange, open }: Props) => {
  const { error, handleCancel, handleSubmit, isPending } = useEditCardDialog({
    card,
    onOpenChange,
  });
  const errorId = "edit-card-error";

  return (
    <Modal
      description="Update the task title and supporting notes."
      isDismissDisabled={isPending}
      onOpenChange={onOpenChange}
      open={open}
      title="Edit card"
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
            defaultValue={card.title}
            disabled={isPending}
            name="title"
            required
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={card.description ?? ""}
            disabled={isPending}
            name="description"
            rows={4}
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
