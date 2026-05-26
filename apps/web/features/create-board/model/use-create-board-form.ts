"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { boardsQueryKey } from "@/entities/board/model/query-keys";
import { type BoardListItem } from "@/entities/board/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import { createBoard, type CreateBoardInput } from "../actions/create-board";

type CreateBoardContext = {
  optimisticBoardId: string;
  previousBoards?: BoardListItem[];
};

export const useCreateBoardForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    BoardListItem,
    Error,
    CreateBoardInput,
    CreateBoardContext
  >({
    mutationFn: createBoard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: boardsQueryKey,
      });

      const previousBoards =
        queryClient.getQueryData<BoardListItem[]>(boardsQueryKey);
      const optimisticBoardId = "optimistic-board-" + crypto.randomUUID();
      const optimisticBoard: BoardListItem = {
        id: optimisticBoardId,
        title: input.title,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<BoardListItem[]>(boardsQueryKey, (current) => [
        optimisticBoard,
        ...(current ?? []),
      ]);
      setError(null);

      return {
        optimisticBoardId,
        previousBoards,
      };
    },
    onError: (mutationError, _input, context) => {
      queryClient.setQueryData(boardsQueryKey, context?.previousBoards ?? []);
      setError(getErrorMessage(mutationError, "Could not create board."));
    },
    onSuccess: (createdBoard, _input, context) => {
      queryClient.setQueryData<BoardListItem[]>(boardsQueryKey, (current) => {
        const boards = current ?? [];
        const hasOptimisticBoard = boards.some(
          (board) => board.id === context.optimisticBoardId,
        );

        if (!hasOptimisticBoard) {
          return [createdBoard, ...boards];
        }

        return boards.map((board) =>
          board.id === context.optimisticBoardId ? createdBoard : board,
        );
      });
      formRef.current?.reset();
      router.refresh();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();

    if (!title) {
      setError("Board title is required.");
      return;
    }

    mutation.mutate({
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
