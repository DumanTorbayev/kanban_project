"use client";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { useCreateCardForm } from "../model/use-create-card-form";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
  open: boolean;
  selectedColumnId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const CreateCardDialog = ({
  boardId,
  columns,
  onOpenChange,
  open,
  selectedColumnId,
}: Props) => {
  const form = useCreateCardForm({
    boardId,
    columns,
    onOpenChange,
    selectedColumnId,
  });

  return (
    <Modal
      description="Create a task and choose the workflow column where it should start."
      onOpenChange={onOpenChange}
      open={open}
      title="Create card"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit}>
        {form.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.error}
          </p>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="title"
            onChange={form.handleTitleChange}
            placeholder="Task title"
            required
            type="text"
            value={form.title}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="description"
            onChange={form.handleDescriptionChange}
            placeholder="Description"
            rows={4}
            value={form.description}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Column</span>
          <select
            className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            disabled={columns.length === 0}
            name="columnId"
            onChange={form.handleColumnChange}
            required
            value={form.columnId}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={form.isPending}
            onClick={form.handleCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={form.isPending || columns.length === 0}
            type="submit"
          >
            {form.isPending ? "Creating..." : "Create card"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
