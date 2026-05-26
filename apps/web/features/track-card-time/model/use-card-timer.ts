"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { activeTimeEntryQueryKey } from "@/entities/time-entry/model/query-keys";
import {
  type ActiveTimeEntry,
  type TimeEntry,
} from "@/entities/time-entry/model/types";
import { getErrorMessage } from "@/shared/lib/errors/get-error-message";

import {
  startCardTimer,
  type StartCardTimerInput,
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
  const queryKey = useMemo(() => activeTimeEntryQueryKey(boardId), [boardId]);
  const [error, setError] = useState<string | null>(null);
  const { data: activeTimeEntry = null } = useQuery({
    enabled: false,
    initialData: initialActiveTimeEntry,
    queryFn: () => Promise.resolve(initialActiveTimeEntry),
    queryKey,
  });
  const startMutation = useMutation<
    ActiveTimeEntry,
    Error,
    StartCardTimerInput
  >({
    mutationFn: startCardTimer,
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError, "Could not start timer."));
    },
    onSuccess: (startedTimeEntry) => {
      queryClient.setQueryData(queryKey, startedTimeEntry);
      setError(null);
    },
  });
  const stopMutation = useMutation<TimeEntry, Error, StopCardTimerInput>({
    mutationFn: stopCardTimer,
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError, "Could not stop timer."));
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
      setError(null);
    },
  });

  useEffect(() => {
    queryClient.setQueryData(queryKey, initialActiveTimeEntry);
  }, [initialActiveTimeEntry, queryClient, queryKey]);

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
