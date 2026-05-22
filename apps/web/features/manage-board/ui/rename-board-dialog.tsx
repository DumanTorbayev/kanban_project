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
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { renameBoard, type RenameBoardInput } from "../actions/rename-board";

interface Props {
  board: BoardDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RenameBoardDialog = ({ board, onOpenChange, open }: Props) => {
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
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries({ queryKey: boardsQueryKey }),
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
          item.id === board.id ? { ...item, title: input.title } : item,
        ),
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();

    if (!title) {
      setError("Board title is required.");
      return;
    }

    mutation.mutate({ boardId: board.id, title });
  };

  return (
    <Modal
      description="Rename this board across the workspace."
      onOpenChange={onOpenChange}
      open={open}
      title="Rename board"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={board.title}
            name="title"
            required
            type="text"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
