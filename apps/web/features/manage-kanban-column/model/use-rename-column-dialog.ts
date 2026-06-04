"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { replaceColumnInBoard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import {
  type KanbanColumn,
  type KanbanColumnWithCards,
} from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  renameKanbanColumn,
  type RenameKanbanColumnInput,
} from "../actions/rename-kanban-column";

interface Props {
  column: KanbanColumnWithCards;
  onOpenChange: (open: boolean) => void;
}

export const useRenameColumnDialog = ({ column, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => kanbanBoardQueryKey(column.board_id),
    [column.board_id],
  );
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    KanbanColumn,
    Error,
    RenameKanbanColumnInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: renameKanbanColumn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);
      const optimisticColumn: KanbanColumn = {
        ...column,
        title: input.title,
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceColumnInBoard(current ?? [], optimisticColumn),
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

      setError(getErrorMessage(mutationError, "Could not rename column."));
    },
    onSuccess: (updatedColumn) => {
      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        replaceColumnInBoard(current ?? [], updatedColumn),
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
      setError("Column title is required.");
      return;
    }

    mutation.mutate({
      boardId: column.board_id,
      columnId: column.id,
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
