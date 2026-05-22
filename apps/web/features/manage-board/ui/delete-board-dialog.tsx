"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  boardQueryKey,
  boardsQueryKey,
} from "@/entities/board/model/query-keys";
import {
  type BoardDetails,
  type BoardListItem,
} from "@/entities/board/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";
import { ConfirmDialog } from "@workspace/ui/components/confirm-dialog";

import { deleteBoard, type DeleteBoardInput } from "../actions/delete-board";

interface Props {
  board: BoardDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteBoardDialog = ({ board, onOpenChange, open }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => boardQueryKey(board.id), [board.id]);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    DeleteBoardInput,
    Error,
    DeleteBoardInput,
    { previousBoard?: BoardDetails; previousBoards?: BoardListItem[] }
  >({
    mutationFn: deleteBoard,
    onMutate: async (input) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries({ queryKey: boardsQueryKey }),
      ]);

      const previousBoard = queryClient.getQueryData<BoardDetails>(queryKey);
      const previousBoards =
        queryClient.getQueryData<BoardListItem[]>(boardsQueryKey);

      queryClient.removeQueries({ queryKey });
      queryClient.setQueryData<BoardListItem[]>(boardsQueryKey, (current) =>
        (current ?? []).filter((item) => item.id !== input.boardId),
      );
      setError(null);

      return { previousBoard, previousBoards };
    },
    onError: (mutationError, _input, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKey, context.previousBoard);
      }

      if (context?.previousBoards) {
        queryClient.setQueryData(boardsQueryKey, context.previousBoards);
      }

      setError(getErrorMessage(mutationError, "Could not delete board."));
    },
    onSuccess: () => {
      onOpenChange(false);
      router.push("/dashboard");
      router.refresh();
    },
  });

  return (
    <ConfirmDialog
      confirmLabel="Delete board"
      description="This board, its columns, and all cards inside it will be permanently removed."
      error={error}
      isPending={mutation.isPending}
      onConfirm={() => mutation.mutate({ boardId: board.id })}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete board?"
    />
  );
};
