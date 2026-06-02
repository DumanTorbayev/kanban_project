"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

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
  const [isHydrated, setIsHydrated] = useState(false);
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
        const boardsWithoutOptimistic = boards.filter(
          (board) => board.id !== context.optimisticBoardId,
        );
        const hasCreatedBoard = boardsWithoutOptimistic.some(
          (board) => board.id === createdBoard.id,
        );

        if (hasCreatedBoard) {
          return boardsWithoutOptimistic.map((board) =>
            board.id === createdBoard.id ? createdBoard : board,
          );
        }

        return [createdBoard, ...boardsWithoutOptimistic];
      });
      formRef.current?.reset();
      router.refresh();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isHydrated || mutation.isPending) {
      return;
    }

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return {
    error,
    formRef,
    handleSubmit,
    isDisabled: !isHydrated || mutation.isPending,
    isPending: mutation.isPending,
  };
};
