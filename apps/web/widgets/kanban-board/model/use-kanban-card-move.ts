"use client";

import {
  useMutation,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import {
  moveCard as moveCardAction,
  type MoveCardInput,
} from "@/features/move-card/actions/move-card";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

export type MoveCardMutationInput = MoveCardInput & {
  nextColumns: KanbanColumnWithCards[];
};

interface Props {
  queryClient: QueryClient;
  queryKey: QueryKey;
}

export const useKanbanCardMove = ({ queryClient, queryKey }: Props) => {
  const router = useRouter();
  const [moveError, setMoveError] = useState<string | null>(null);
  const moveCardMutation = useMutation<
    MoveCardInput,
    Error,
    MoveCardMutationInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: (input) =>
      moveCardAction({
        boardId: input.boardId,
        cardId: input.cardId,
        columnId: input.columnId,
        position: input.position,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);

      queryClient.setQueryData(queryKey, input.nextColumns);
      setMoveError(null);

      return {
        previousColumns,
      };
    },
    onError: (error, _input, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(queryKey, context.previousColumns);
      }

      setMoveError(getErrorMessage(error, "Could not move card."));
    },
    onSuccess: () => {
      setMoveError(null);
      router.refresh();
    },
  });

  const resetMoveError = () => {
    setMoveError(null);
  };

  return {
    isMoving: moveCardMutation.isPending,
    moveCard: moveCardMutation.mutate,
    moveError,
    resetMoveError,
  };
};
