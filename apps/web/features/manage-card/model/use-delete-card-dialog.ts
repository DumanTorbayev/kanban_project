"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { removeCardFromBoard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanCard,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import { deleteCard, type DeleteCardInput } from "../actions/delete-card";

interface Props {
  card: KanbanCard;
  onOpenChange: (open: boolean) => void;
}

export const useDeleteCardDialog = ({ card, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => kanbanBoardQueryKey(card.board_id),
    [card.board_id],
  );
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    DeleteCardInput,
    Error,
    DeleteCardInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: deleteCard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        removeCardFromBoard(current ?? [], input.cardId),
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

      setError(getErrorMessage(mutationError, "Could not delete card."));
    },
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleConfirm = () => {
    mutation.mutate({
      boardId: card.board_id,
      cardId: card.id,
    });
  };

  return {
    error,
    handleConfirm,
    isPending: mutation.isPending,
  };
};
