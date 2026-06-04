"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { replaceCardInBoard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanCard,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import { updateCard, type UpdateCardInput } from "../actions/update-card";

interface Props {
  card: KanbanCard;
  onOpenChange: (open: boolean) => void;
}

export const useEditCardDialog = ({ card, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => kanbanBoardQueryKey(card.board_id),
    [card.board_id],
  );
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    KanbanCard,
    Error,
    UpdateCardInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: updateCard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);
      const optimisticCard: KanbanCard = {
        ...card,
        title: input.title,
        description: input.description,
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceCardInBoard(current ?? [], optimisticCard),
      );
      setError(null);

      return {
        previousColumns,
      };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(queryKey, context.previousColumns);
      }

      setError(getErrorMessage(mutationError, "Could not update card."));
    },
    onSuccess: (updatedCard) => {
      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceCardInBoard(current ?? [], updatedCard),
      );
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleCancel = () => {
    if (mutation.isPending) {
      return;
    }

    onOpenChange(false);
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mutation.isPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title) {
      setError("Card title is required.");
      return;
    }

    mutation.mutate({
      boardId: card.board_id,
      cardId: card.id,
      title,
      description: description || null,
    });
  };

  return {
    error,
    handleCancel,
    handleSubmit,
    isPending: mutation.isPending,
  };
};
