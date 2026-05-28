"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  replaceCompletedTimeEntryInHistory,
  sortCompletedTimeEntries,
} from "@/entities/time-entry/lib/filter-time-entries";
import { boardTimeEntriesQueryKey } from "@/entities/time-entry/model/query-keys";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  updateTimeEntry,
  type UpdateTimeEntryInput,
} from "../actions/update-time-entry";
import { fromDateTimeLocalValue, getDurationSeconds } from "./date-time-local";
import {
  getTimeEntryCacheSnapshot,
  cancelTimeEntryCacheQueries,
  restoreTimeEntryCaches,
  type TimeEntryCacheSnapshot,
  updateTimeEntryCaches,
} from "./time-entry-cache";

interface Props {
  onOpenChange: (open: boolean) => void;
  timeEntry: CompletedTimeEntry;
}

export const useEditTimeEntryDialog = ({ onOpenChange, timeEntry }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation<
    CompletedTimeEntry,
    Error,
    UpdateTimeEntryInput,
    TimeEntryCacheSnapshot
  >({
    mutationFn: updateTimeEntry,
    onMutate: async (input) => {
      await cancelTimeEntryCacheQueries(queryClient, input.boardId);

      const snapshot = getTimeEntryCacheSnapshot(queryClient, input.boardId);
      const optimisticTimeEntry: CompletedTimeEntry = {
        ...timeEntry,
        duration_seconds: getDurationSeconds(input.startedAt, input.stoppedAt),
        started_at: input.startedAt,
        stopped_at: input.stoppedAt,
        updated_at: new Date().toISOString(),
      };
      const currentTimeEntries = sortCompletedTimeEntries(
        snapshot.previousTimeEntries ?? [timeEntry],
      );
      const nextTimeEntries = replaceCompletedTimeEntryInHistory(
        currentTimeEntries,
        optimisticTimeEntry,
      );

      updateTimeEntryCaches({
        boardId: input.boardId,
        cardId: timeEntry.card_id,
        deltaSeconds:
          optimisticTimeEntry.duration_seconds - timeEntry.duration_seconds,
        queryClient,
        timeEntries: nextTimeEntries,
      });
      setError(null);

      return snapshot;
    },
    onError: (mutationError, input, context) => {
      restoreTimeEntryCaches(queryClient, input.boardId, context);
      setError(getErrorMessage(mutationError, "Could not update time entry."));
    },
    onSuccess: (updatedTimeEntry) => {
      const currentTimeEntries = queryClient.getQueryData<CompletedTimeEntry[]>(
        boardTimeEntriesQueryKey(updatedTimeEntry.board_id),
      ) ?? [timeEntry];
      const currentTimeEntry =
        currentTimeEntries.find((entry) => entry.id === updatedTimeEntry.id) ??
        timeEntry;
      const nextTimeEntries = replaceCompletedTimeEntryInHistory(
        currentTimeEntries,
        updatedTimeEntry,
      );

      updateTimeEntryCaches({
        boardId: updatedTimeEntry.board_id,
        cardId: updatedTimeEntry.card_id,
        deltaSeconds:
          updatedTimeEntry.duration_seconds - currentTimeEntry.duration_seconds,
        queryClient,
        timeEntries: nextTimeEntries,
      });
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleCancel = () => onOpenChange(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const startedAt = fromDateTimeLocalValue(
      String(formData.get("startedAt") ?? ""),
    );
    const stoppedAt = fromDateTimeLocalValue(
      String(formData.get("stoppedAt") ?? ""),
    );

    if (!startedAt || !stoppedAt) {
      setError("Start and stop times are required.");
      return;
    }

    if (Date.parse(stoppedAt) <= Date.parse(startedAt)) {
      setError("Stop time must be after start time.");
      return;
    }

    mutation.mutate({
      boardId: timeEntry.board_id,
      startedAt,
      stoppedAt,
      timeEntryId: timeEntry.id,
    });
  };

  return {
    error,
    handleCancel,
    handleSubmit,
    isPending: mutation.isPending,
  };
};
