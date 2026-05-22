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
import { Button } from "@workspace/ui/components/button";
import { Modal } from "@workspace/ui/components/modal";

import { updateCard, type UpdateCardInput } from "../actions/update-card";

interface Props {
  card: KanbanCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditCardDialog = ({ card, onOpenChange, open }: Props) => {
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
      await queryClient.cancelQueries({ queryKey });

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

      return { previousColumns };
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

  return (
    <Modal
      description="Update the task title and supporting notes."
      onOpenChange={onOpenChange}
      open={open}
      title="Edit card"
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
            defaultValue={card.title}
            name="title"
            required
            type="text"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={card.description ?? ""}
            name="description"
            rows={4}
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
