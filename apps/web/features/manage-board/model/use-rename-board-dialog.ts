"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  boardQueryKey,
  boardsQueryKey,
} from "@/entities/board/model/query-keys";
import {
  type BoardDetails,
  type BoardListItem,
} from "@/entities/board/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import { renameBoard, type RenameBoardInput } from "../actions/rename-board";

interface Props {
  board: BoardDetails;
  onOpenChange: (open: boolean) => void;
}

export const useRenameBoardDialog = ({ board, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardQueryKey(board.id), [board.id]);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    BoardDetails,
    Error,
    RenameBoardInput,
    { previousBoard?: BoardDetails; previousBoards?: BoardListItem[] }
  >({
    mutationFn: renameBoard,
    onMutate: async (input) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey,
        }),
        queryClient.cancelQueries({
          queryKey: boardsQueryKey,
        }),
      ]);

      const previousBoard = queryClient.getQueryData<BoardDetails>(queryKey);
      const previousBoards =
        queryClient.getQueryData<BoardListItem[]>(boardsQueryKey);
      const optimisticBoard: BoardDetails = {
        ...board,
        title: input.title,
      };

      queryClient.setQueryData(queryKey, optimisticBoard);
      queryClient.setQueryData<BoardListItem[]>(boardsQueryKey, (current) =>
        (current ?? []).map((item) =>
          item.id === board.id
            ? {
                ...item,
                title: input.title,
              }
            : item,
        ),
      );
      setError(null);

      return {
        previousBoard,
        previousBoards,
      };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKey, context.previousBoard);
      }

      if (context?.previousBoards) {
        queryClient.setQueryData(boardsQueryKey, context.previousBoards);
      }

      setError(getErrorMessage(mutationError, "Could not rename board."));
    },
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(queryKey, updatedBoard);
      queryClient.setQueryData<BoardListItem[]>(boardsQueryKey, (current) =>
        (current ?? []).map((item) =>
          item.id === updatedBoard.id ? updatedBoard : item,
        ),
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

    if (!title) {
      setError("Board title is required.");
      return;
    }

    mutation.mutate({
      boardId: board.id,
      title,
    });
  };

  return {
    error,
    handleCancel,
    handleSubmit,
    isPending: mutation.isPending,
  };
};
