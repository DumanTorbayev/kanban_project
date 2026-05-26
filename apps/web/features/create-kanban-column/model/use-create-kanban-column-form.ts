"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";

import {
  addColumnToBoard,
  replaceColumnIdInBoard,
} from "@/entities/kanban/lib/cache-updaters";
import { getNextPosition } from "@/entities/kanban/lib/position";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  createKanbanColumn,
  type CreateKanbanColumnInput,
} from "../actions/create-kanban-column";

interface Props {
  boardId: string;
}

type CreateColumnContext = {
  optimisticColumnId: string;
  previousColumns?: KanbanColumnWithCards[];
};

export const useCreateKanbanColumnForm = ({ boardId }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => kanbanBoardQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    KanbanColumn,
    Error,
    CreateKanbanColumnInput,
    CreateColumnContext
  >({
    mutationFn: createKanbanColumn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);
      const columns = previousColumns ?? [];
      const lastPosition = Math.max(
        0,
        ...columns.map((column) => Number(column.position)),
      );
      const now = new Date().toISOString();
      const optimisticColumnId = "optimistic-column-" + crypto.randomUUID();
      const optimisticColumn: KanbanColumnWithCards = {
        id: optimisticColumnId,
        board_id: input.boardId,
        title: input.title,
        position: getNextPosition(lastPosition),
        created_at: now,
        updated_at: now,
        cards: [],
      };

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        addColumnToBoard(current ?? [], optimisticColumn),
      );
      setError(null);

      return {
        optimisticColumnId,
        previousColumns,
      };
    },
    onError: (mutationError, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previousColumns ?? []);
      setError(getErrorMessage(mutationError, "Could not create column."));
    },
    onSuccess: (createdColumn, _input, context) => {
      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceColumnIdInBoard(
          current ?? [],
          context.optimisticColumnId,
          createdColumn,
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

    if (!title) {
      setError("Column title is required.");
      return;
    }

    mutation.mutate({
      boardId,
      title,
    });
  };

  return {
    error,
    formRef,
    handleSubmit,
    isPending: mutation.isPending,
  };
};
