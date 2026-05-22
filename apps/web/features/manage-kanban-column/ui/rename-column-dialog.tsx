"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { replaceColumnInBoard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import {
  renameKanbanColumn,
  type RenameKanbanColumnInput,
} from "../actions/rename-kanban-column";

interface Props {
  column: KanbanColumnWithCards;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RenameColumnDialog = ({ column, onOpenChange, open }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => kanbanBoardQueryKey(column.board_id),
    [column.board_id],
  );
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    KanbanColumn,
    Error,
    RenameKanbanColumnInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: renameKanbanColumn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);
      const optimisticColumn: KanbanColumn = {
        ...column,
        title: input.title,
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceColumnInBoard(current ?? [], optimisticColumn),
      );
      setError(null);

      return { previousColumns };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(queryKey, context.previousColumns);
      }

      setError(getErrorMessage(mutationError, "Could not rename column."));
    },
    onSuccess: (updatedColumn) => {
      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceColumnInBoard(current ?? [], updatedColumn),
      );
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();

    if (!title) {
      setError("Column title is required.");
      return;
    }

    mutation.mutate({
      boardId: column.board_id,
      columnId: column.id,
      title,
    });
  };

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
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
