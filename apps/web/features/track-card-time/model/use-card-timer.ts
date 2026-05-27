"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { addTrackedSecondsToCard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { addCompletedTimeEntryToSummary } from "@/entities/time-entry/lib/build-board-time-summary";
import { addCompletedTimeEntryToHistory } from "@/entities/time-entry/lib/filter-time-entries";
import {
  activeTimeEntryQueryKey,
  boardTimeEntriesQueryKey,
  boardTimeSummaryQueryKey,
} from "@/entities/time-entry/model/query-keys";
import {
  type ActiveTimeEntry,
  type BoardTimeSummary,
  type CompletedTimeEntry,
  type TimeEntry,
} from "@/entities/time-entry/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  startCardTimer,
  type StartCardTimerInput,
  type StartCardTimerResult,
} from "../actions/start-card-timer";
import {
  stopCardTimer,
  type StopCardTimerInput,
} from "../actions/stop-card-timer";

interface Props {
  boardId: string;
  initialActiveTimeEntry: ActiveTimeEntry | null;
}

export type CardTimerControls = {
  activeTimeEntry: ActiveTimeEntry | null;
  error: string | null;
  isMutating: boolean;
  startTimer: (cardId: string) => void;
  stopTimer: (cardId: string) => void;
};

export const useCardTimer = ({
  boardId,
  initialActiveTimeEntry,
}: Props): CardTimerControls => {
  const queryClient = useQueryClient();
  const activeTimeEntryQuery = useMemo(
    () => activeTimeEntryQueryKey(boardId),
    [boardId],
  );
  const kanbanBoardQuery = useMemo(
    () => kanbanBoardQueryKey(boardId),
    [boardId],
  );
  const timeSummaryQuery = useMemo(
    () => boardTimeSummaryQueryKey(boardId),
    [boardId],
  );
  const timeEntriesQuery = useMemo(
    () => boardTimeEntriesQueryKey(boardId),
    [boardId],
  );
  const [error, setError] = useState<string | null>(null);
  const { data: activeTimeEntry = null } = useQuery({
    enabled: false,
    initialData: initialActiveTimeEntry,
    queryFn: () => Promise.resolve(initialActiveTimeEntry),
    queryKey: activeTimeEntryQuery,
  });
  const syncCompletedTimeEntry = (timeEntry: TimeEntry | null) => {
    if (!timeEntry) {
      return;
    }

    queryClient.setQueryData<KanbanColumnWithCards[]>(
      kanbanBoardQuery,
      (currentColumns) =>
        addTrackedSecondsToCard(
          currentColumns ?? [],
          timeEntry.card_id,
          timeEntry.duration_seconds,
        ),
    );
    queryClient.setQueryData<BoardTimeSummary>(
      timeSummaryQuery,
      (currentSummary) =>
        currentSummary
          ? addCompletedTimeEntryToSummary(currentSummary, timeEntry)
          : currentSummary,
    );
    queryClient.setQueryData<CompletedTimeEntry[]>(
      timeEntriesQuery,
      (currentTimeEntries) =>
        currentTimeEntries
          ? addCompletedTimeEntryToHistory(currentTimeEntries, timeEntry)
          : currentTimeEntries,
    );
  };
  const startMutation = useMutation<
    StartCardTimerResult,
    Error,
    StartCardTimerInput
  >({
    mutationFn: startCardTimer,
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError, "Could not start timer."));
    },
    onSuccess: (result) => {
      syncCompletedTimeEntry(result.stoppedTimeEntry);
      queryClient.setQueryData(activeTimeEntryQuery, result.activeTimeEntry);
      setError(null);
    },
  });
  const stopMutation = useMutation<TimeEntry, Error, StopCardTimerInput>({
    mutationFn: stopCardTimer,
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError, "Could not stop timer."));
    },
    onSuccess: (stoppedTimeEntry) => {
      syncCompletedTimeEntry(stoppedTimeEntry);
      queryClient.setQueryData(activeTimeEntryQuery, null);
      setError(null);
    },
  });

  useEffect(() => {
    queryClient.setQueryData(activeTimeEntryQuery, initialActiveTimeEntry);
  }, [initialActiveTimeEntry, queryClient, activeTimeEntryQuery]);

  const startTimer = (cardId: string) => {
    startMutation.mutate({
      boardId,
      cardId,
    });
  };
  const stopTimer = (cardId: string) => {
    if (!activeTimeEntry) {
      setError("Active timer was not found.");
      return;
    }

    stopMutation.mutate({
      boardId,
      cardId,
      timeEntryId: activeTimeEntry.id,
    });
  };

  return {
    activeTimeEntry,
    error,
    isMutating: startMutation.isPending || stopMutation.isPending,
    startTimer,
    stopTimer,
  };
};
