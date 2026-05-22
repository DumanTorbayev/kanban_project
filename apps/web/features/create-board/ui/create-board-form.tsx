"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { boardsQueryKey } from "@/entities/board/model/query-keys";
import { type BoardListItem } from "@/entities/board/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";
import { Button } from "@workspace/ui/components/button";

import { createBoard, type CreateBoardInput } from "../actions/create-board";

type CreateBoardContext = {
  optimisticBoardId: string;
  previousBoards?: BoardListItem[];
};

export const CreateBoardForm = () => {
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
      await queryClient.cancelQueries({ queryKey: boardsQueryKey });

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

      return { optimisticBoardId, previousBoards };
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

    mutation.mutate({ title });
  };

  return (
    <section className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-medium">Create board</h2>
        <p className="text-sm text-muted-foreground">
          Start with a workspace for a product, sprint, or team.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Board title</span>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            name="title"
            type="text"
            placeholder="Product Roadmap"
            required
          />
        </label>
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Creating..." : "Create board"}
        </Button>
      </form>
    </section>
  );
};
