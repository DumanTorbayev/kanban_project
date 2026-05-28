"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { removeCompletedTimeEntryFromHistory } from "@/entities/time-entry/lib/filter-time-entries";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  deleteTimeEntry,
  type DeleteTimeEntryInput,
} from "../actions/delete-time-entry";
import {
  cancelTimeEntryCacheQueries,
  getTimeEntryCacheSnapshot,
  restoreTimeEntryCaches,
  type TimeEntryCacheSnapshot,
  updateTimeEntryCaches,
} from "./time-entry-cache";

interface Props {
  onOpenChange: (open: boolean) => void;
  timeEntry: CompletedTimeEntry;
}

export const useDeleteTimeEntryDialog = ({
  onOpenChange,
  timeEntry,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    CompletedTimeEntry,
    Error,
    DeleteTimeEntryInput,
    TimeEntryCacheSnapshot
  >({
    mutationFn: deleteTimeEntry,
    onMutate: async (input) => {
      await cancelTimeEntryCacheQueries(queryClient, input.boardId);

      const snapshot = getTimeEntryCacheSnapshot(queryClient, input.boardId);
      const currentTimeEntries = snapshot.previousTimeEntries ?? [timeEntry];
      const nextTimeEntries = removeCompletedTimeEntryFromHistory(
        currentTimeEntries,
        input.timeEntryId,
      );

      updateTimeEntryCaches({
        boardId: input.boardId,
        cardId: timeEntry.card_id,
        deltaSeconds: -timeEntry.duration_seconds,
        queryClient,
        timeEntries: nextTimeEntries,
      });
      setError(null);

      return snapshot;
    },
    onError: (mutationError, input, context) => {
      restoreTimeEntryCaches(queryClient, input.boardId, context);
      setError(getErrorMessage(mutationError, "Could not delete time entry."));
    },
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleConfirm = () => {
    mutation.mutate({
      boardId: timeEntry.board_id,
      timeEntryId: timeEntry.id,
    });
  };

  return {
    error,
    handleConfirm,
    isPending: mutation.isPending,
  };
};
