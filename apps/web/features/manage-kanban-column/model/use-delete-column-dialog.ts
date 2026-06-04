"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { removeColumnFromBoard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  deleteKanbanColumn,
  type DeleteKanbanColumnInput,
} from "../actions/delete-kanban-column";

interface Props {
  column: KanbanColumnWithCards;
  onOpenChange: (open: boolean) => void;
}

export const useDeleteColumnDialog = ({ column, onOpenChange }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => kanbanBoardQueryKey(column.board_id),
    [column.board_id],
  );
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    DeleteKanbanColumnInput,
    Error,
    DeleteKanbanColumnInput,
    { previousColumns?: KanbanColumnWithCards[] }
  >({
    mutationFn: deleteKanbanColumn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousColumns =
        queryClient.getQueryData<KanbanColumnWithCards[]>(queryKey);

      queryClient.setQueryData<KanbanColumnWithCards[]>(queryKey, (current) =>
        removeColumnFromBoard(current ?? [], input.columnId),
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

      setError(getErrorMessage(mutationError, "Could not delete column."));
    },
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleConfirm = () => {
    if (mutation.isPending) {
      return;
    }

    mutation.mutate({
      boardId: column.board_id,
      columnId: column.id,
    });
  };

  return {
    error,
    handleConfirm,
    isPending: mutation.isPending,
  };
};
