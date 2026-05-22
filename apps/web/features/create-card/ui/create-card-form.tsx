"use client";

import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";

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

import { createCard, type CreateCardInput } from "../actions/create-card";

interface Props {
  boardId: string;
  columnId: string;
}

type CreateCardContext = {
  optimisticCardId: string;
  previousColumns?: KanbanColumnWithCards[];
};

export const CreateCardForm = ({ boardId, columnId }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    KanbanCard,
    Error,
    CreateCardInput,
    CreateCardContext
  >({
    mutationFn: createCard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });

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

      return { optimisticCardId, previousColumns };
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
      formRef.current?.reset();
      router.refresh();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title) {
      setError("Card title is required.");
      return;
    }

    mutation.mutate({
      boardId,
      columnId,
      title,
      description: description || null,
    });
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit} ref={formRef}>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="sr-only">Card title</span>
        <input
          className="h-8 w-full rounded-md border bg-background px-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          name="title"
          placeholder="Task title"
          required
          type="text"
        />
      </label>
      <label className="block">
        <span className="sr-only">Card description</span>
        <textarea
          className="min-h-16 w-full resize-none rounded-md border bg-background px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          name="description"
          placeholder="Description"
          rows={2}
        />
      </label>
      <Button
        className="w-full"
        disabled={mutation.isPending}
        size="sm"
        type="submit"
        variant="outline"
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        {mutation.isPending ? "Adding..." : "Add card"}
      </Button>
    </form>
  );
};
