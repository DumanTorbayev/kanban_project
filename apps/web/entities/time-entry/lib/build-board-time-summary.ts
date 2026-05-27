import {
  type BoardTimeSummary,
  type CompletedTimeEntry,
  type TimeEntry,
  type TimeEntryCardSummary,
} from "../model/types";

const RECENT_TIME_ENTRIES_LIMIT = 5;

const normalizeSummaryDuration = (durationSeconds: number) => {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return 0;
  }

  return Math.floor(durationSeconds);
};

const getTimeValue = (value: string) => {
  const parsedTime = Date.parse(value);

  if (!Number.isFinite(parsedTime)) {
    return 0;
  }

  return parsedTime;
};

const compareCompletedTimeEntries = (
  leftEntry: CompletedTimeEntry,
  rightEntry: CompletedTimeEntry,
) => getTimeValue(rightEntry.stopped_at) - getTimeValue(leftEntry.stopped_at);

const compareCardSummaries = (
  leftSummary: TimeEntryCardSummary,
  rightSummary: TimeEntryCardSummary,
) =>
  rightSummary.totalDurationSeconds - leftSummary.totalDurationSeconds ||
  rightSummary.completedEntryCount - leftSummary.completedEntryCount ||
  leftSummary.cardId.localeCompare(rightSummary.cardId);

const getLatestStoppedAt = (
  currentStoppedAt: string | null,
  stoppedAt: string,
) => {
  if (!currentStoppedAt) {
    return stoppedAt;
  }

  return getTimeValue(stoppedAt) > getTimeValue(currentStoppedAt)
    ? stoppedAt
    : currentStoppedAt;
};

const toCompletedTimeEntry = (timeEntry: TimeEntry) => {
  const durationSeconds = normalizeSummaryDuration(timeEntry.duration_seconds);

  if (!timeEntry.stopped_at || durationSeconds === 0) {
    return null;
  }

  return {
    ...timeEntry,
    duration_seconds: durationSeconds,
    stopped_at: timeEntry.stopped_at,
  } satisfies CompletedTimeEntry;
};

export const createEmptyBoardTimeSummary = (
  boardId: string,
): BoardTimeSummary => ({
  boardId,
  cardSummaries: [],
  completedEntryCount: 0,
  recentEntries: [],
  totalDurationSeconds: 0,
});

export const buildBoardTimeSummary = (
  boardId: string,
  timeEntries: TimeEntry[],
): BoardTimeSummary => {
  const cardSummaryById = new Map<string, TimeEntryCardSummary>();
  const completedEntries = timeEntries.flatMap((timeEntry) => {
    if (timeEntry.board_id !== boardId) {
      return [];
    }

    const completedTimeEntry = toCompletedTimeEntry(timeEntry);

    return completedTimeEntry ? [completedTimeEntry] : [];
  });
  let totalDurationSeconds = 0;

  for (const timeEntry of completedEntries) {
    totalDurationSeconds += timeEntry.duration_seconds;

    const currentCardSummary = cardSummaryById.get(timeEntry.card_id) ?? {
      cardId: timeEntry.card_id,
      completedEntryCount: 0,
      lastStoppedAt: null,
      totalDurationSeconds: 0,
    };

    cardSummaryById.set(timeEntry.card_id, {
      ...currentCardSummary,
      completedEntryCount: currentCardSummary.completedEntryCount + 1,
      lastStoppedAt: getLatestStoppedAt(
        currentCardSummary.lastStoppedAt,
        timeEntry.stopped_at,
      ),
      totalDurationSeconds:
        currentCardSummary.totalDurationSeconds + timeEntry.duration_seconds,
    });
  }

  return {
    boardId,
    cardSummaries: [...cardSummaryById.values()].sort(compareCardSummaries),
    completedEntryCount: completedEntries.length,
    recentEntries: [...completedEntries]
      .sort(compareCompletedTimeEntries)
      .slice(0, RECENT_TIME_ENTRIES_LIMIT),
    totalDurationSeconds,
  };
};

export const addCompletedTimeEntryToSummary = (
  summary: BoardTimeSummary,
  timeEntry: TimeEntry | null,
): BoardTimeSummary => {
  if (!timeEntry || timeEntry.board_id !== summary.boardId) {
    return summary;
  }

  const completedTimeEntry = toCompletedTimeEntry(timeEntry);

  if (!completedTimeEntry) {
    return summary;
  }

  if (
    summary.recentEntries.some((entry) => entry.id === completedTimeEntry.id)
  ) {
    return summary;
  }

  const currentCardSummary = summary.cardSummaries.find(
    (cardSummary) => cardSummary.cardId === completedTimeEntry.card_id,
  ) ?? {
    cardId: completedTimeEntry.card_id,
    completedEntryCount: 0,
    lastStoppedAt: null,
    totalDurationSeconds: 0,
  };
  const nextCardSummary: TimeEntryCardSummary = {
    ...currentCardSummary,
    completedEntryCount: currentCardSummary.completedEntryCount + 1,
    lastStoppedAt: getLatestStoppedAt(
      currentCardSummary.lastStoppedAt,
      completedTimeEntry.stopped_at,
    ),
    totalDurationSeconds:
      currentCardSummary.totalDurationSeconds +
      completedTimeEntry.duration_seconds,
  };

  return {
    ...summary,
    cardSummaries: [
      ...summary.cardSummaries.filter(
        (cardSummary) => cardSummary.cardId !== completedTimeEntry.card_id,
      ),
      nextCardSummary,
    ].sort(compareCardSummaries),
    completedEntryCount: summary.completedEntryCount + 1,
    recentEntries: [completedTimeEntry, ...summary.recentEntries]
      .sort(compareCompletedTimeEntries)
      .slice(0, RECENT_TIME_ENTRIES_LIMIT),
    totalDurationSeconds:
      summary.totalDurationSeconds + completedTimeEntry.duration_seconds,
  };
};
