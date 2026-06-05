"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { boardsQueryKey } from "@/entities/board/model/query-keys";
import {
  type BoardDetails,
  type BoardListItem,
} from "@/entities/board/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import { deleteBoard, type DeleteBoardInput } from "../actions/delete-board";

interface Props {
  board: BoardDetails;
}

export const useDeleteBoardDialog = ({ board }: Props) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    DeleteBoardInput,
    Error,
    DeleteBoardInput,
    { previousBoards?: BoardListItem[] }
  >({
    mutationFn: deleteBoard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: boardsQueryKey,
      });

      const previousBoards =
        queryClient.getQueryData<BoardListItem[]>(boardsQueryKey);

      queryClient.setQueryData<BoardListItem[]>(boardsQueryKey, (current) =>
        (current ?? []).filter((item) => item.id !== input.boardId),
      );
      setError(null);

      return {
        previousBoards,
      };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(boardsQueryKey, context.previousBoards);
      }

      setError(getErrorMessage(mutationError, "Could not delete board."));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: boardsQueryKey,
      });
      globalThis.location.replace("/dashboard");
    },
  });

  const handleConfirm = () => {
    if (mutation.isPending) {
      return;
    }

    mutation.mutate({
      boardId: board.id,
    });
  };

  return {
    error,
    handleConfirm,
    isPending: mutation.isPending,
  };
};
