"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

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

import { createCard, type CreateCardInput } from "../actions/create-card";

interface Props {
  boardId: string;
  columns: KanbanColumnWithCards[];
  selectedColumnId: string | null;
  onOpenChange: (open: boolean) => void;
}

type CreateCardContext = {
  optimisticCardId: string;
  previousColumns?: KanbanColumnWithCards[];
};

export const useCreateCardForm = ({
  boardId,
  columns,
  onOpenChange,
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
        tracked_seconds: 0,
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

  const handleCancel = () => onOpenChange(false);
  const handleColumnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setColumnId(event.target.value);
  };
  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };
  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
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

  return {
    columnId,
    description,
    error,
    handleCancel,
    handleColumnChange,
    handleDescriptionChange,
    handleSubmit,
    handleTitleChange,
    isPending: mutation.isPending,
    title,
  };
};
