"use client";

import { type QueryClient } from "@tanstack/react-query";

import { adjustTrackedSecondsForCard } from "@/entities/kanban/lib/cache-updaters";
import { kanbanBoardQueryKey } from "@/entities/kanban/model/query-keys";
import { type KanbanColumnWithCards } from "@/entities/kanban/model/types";
import { buildBoardTimeSummary } from "@/entities/time-entry/lib/build-board-time-summary";
import {
  boardTimeEntriesQueryKey,
  boardTimeSummaryQueryKey,
} from "@/entities/time-entry/model/query-keys";
import {
  type BoardTimeSummary,
  type CompletedTimeEntry,
} from "@/entities/time-entry/model/types";

export type TimeEntryCacheSnapshot = {
  previousColumns?: KanbanColumnWithCards[];
  previousSummary?: BoardTimeSummary;
  previousTimeEntries?: CompletedTimeEntry[];
};

interface UpdateTimeEntryCachesInput {
  boardId: string;
  cardId: string;
  deltaSeconds: number;
  queryClient: QueryClient;
  timeEntries: CompletedTimeEntry[];
}

export const getTimeEntryCacheSnapshot = (
  queryClient: QueryClient,
  boardId: string,
): TimeEntryCacheSnapshot => ({
  previousColumns: queryClient.getQueryData<KanbanColumnWithCards[]>(
    kanbanBoardQueryKey(boardId),
  ),
  previousSummary: queryClient.getQueryData<BoardTimeSummary>(
    boardTimeSummaryQueryKey(boardId),
  ),
  previousTimeEntries: queryClient.getQueryData<CompletedTimeEntry[]>(
    boardTimeEntriesQueryKey(boardId),
  ),
});

export const cancelTimeEntryCacheQueries = (
  queryClient: QueryClient,
  boardId: string,
) =>
  Promise.all([
    queryClient.cancelQueries({
      queryKey: kanbanBoardQueryKey(boardId),
    }),
    queryClient.cancelQueries({
      queryKey: boardTimeSummaryQueryKey(boardId),
    }),
    queryClient.cancelQueries({
      queryKey: boardTimeEntriesQueryKey(boardId),
    }),
  ]);

export const restoreTimeEntryCaches = (
  queryClient: QueryClient,
  boardId: string,
  snapshot?: TimeEntryCacheSnapshot,
) => {
  if (snapshot?.previousColumns) {
    queryClient.setQueryData(
      kanbanBoardQueryKey(boardId),
      snapshot.previousColumns,
    );
  }

  if (snapshot?.previousSummary) {
    queryClient.setQueryData(
      boardTimeSummaryQueryKey(boardId),
      snapshot.previousSummary,
    );
  }

  if (snapshot?.previousTimeEntries) {
    queryClient.setQueryData(
      boardTimeEntriesQueryKey(boardId),
      snapshot.previousTimeEntries,
    );
  }
};

export const updateTimeEntryCaches = ({
  boardId,
  cardId,
  deltaSeconds,
  queryClient,
  timeEntries,
}: UpdateTimeEntryCachesInput) => {
  queryClient.setQueryData(boardTimeEntriesQueryKey(boardId), timeEntries);
  queryClient.setQueryData(
    boardTimeSummaryQueryKey(boardId),
    buildBoardTimeSummary(boardId, timeEntries),
  );
  queryClient.setQueryData<KanbanColumnWithCards[]>(
    kanbanBoardQueryKey(boardId),
    (currentColumns) =>
      adjustTrackedSecondsForCard(currentColumns ?? [], cardId, deltaSeconds),
  );
};
