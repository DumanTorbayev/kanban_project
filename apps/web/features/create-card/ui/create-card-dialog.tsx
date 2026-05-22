"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  addCardToBoard,
  replaceCardIdInBoard,
} from "@/entities/kanban/lib/cache-updaters";
import { getNextPosition } from "@/entities/kanban/lib/position";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanCard,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { createCard, type CreateCardInput } from "../actions/create-card";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
  open: boolean;
  selectedColumnId: string | null;
  onOpenChange: (open: boolean) => void;
}

type CreateCardContext = {
  optimisticCardId: string;
  previousColumns?: KanbanColumnWithCards[];
};

export const CreateCardDialog = ({
  boardId,
  columns,
  onOpenChange,
  open,
  selectedColumnId,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const defaultColumnId = selectedColumnId ?? columns[0]?.id ?? "";
  const [columnId, setColumnId] = useState(defaultColumnId);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const mutation = useMutation<
    KanbanCard,
    Error,
    CreateCardInput,
    CreateCardContext
  >({
    mutationFn: createCard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);
      const columnCards =
        previousColumns?.find((column) => column.id === input.columnId)
          ?.cards ?? [];
      const lastPosition = Math.max(
        0,
        ...columnCards.map((card) => Number(card.position)),
      );
      const now = new Date().toISOString();
      const optimisticCardId = "optimistic-card-" + crypto.randomUUID();
      const optimisticCard: KanbanCard = {
        id: optimisticCardId,
        board_id: input.boardId,
        column_id: input.columnId,
        title: input.title,
        description: input.description,
        position: getNextPosition(lastPosition),
        created_by: "optimistic",
        assignee_id: null,
        created_at: now,
        updated_at: now,
      };

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        addCardToBoard(current ?? [], optimisticCard),
      );
      setError(null);

      return {
        optimisticCardId,
        previousColumns,
      };
    },
    onError: (mutationError, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previousColumns ?? []);
      setError(getErrorMessage(mutationError, "Could not create card."));
    },
    onSuccess: (createdCard, _input, context) => {
      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceCardIdInBoard(
          current ?? [],
          context.optimisticCardId,
          createdCard,
        ),
      );
      setDescription("");
      setTitle("");
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      setError("Card title is required.");
      return;
    }

    if (!columnId) {
      setError("Column is required.");
      return;
    }

    mutation.mutate({
      boardId,
      columnId,
      title: normalizedTitle,
      description: normalizedDescription || null,
    });
  };

  return (
    <Modal
      description="Create a task and choose the workflow column where it should start."
      onOpenChange={onOpenChange}
      open={open}
      title="Create card"
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
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            required
            type="text"
            value={title}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            rows={4}
            value={description}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Column</span>
          <select
            className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            disabled={columns.length === 0}
            name="columnId"
            onChange={(event) => setColumnId(event.target.value)}
            required
            value={columnId}
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
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending || columns.length === 0}
            type="submit"
          >
            {mutation.isPending ? "Creating..." : "Create card"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
