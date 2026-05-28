import {
  type CompletedTimeEntry,
  type TimeEntry,
  type TimeEntriesHistoryFilters,
} from "../model/types";

const getTimeValue = (value: string) => {
  const parsedTime = Date.parse(value);

  if (!Number.isFinite(parsedTime)) {
    return 0;
  }

  return parsedTime;
};

const getUtcDayStart = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const getUtcWeekStart = (date: Date) => {
  const dayStart = new Date(getUtcDayStart(date));
  const dayOfWeek = dayStart.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return dayStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000;
};

const getPeriodStart = (
  period: TimeEntriesHistoryFilters["period"],
  now: Date,
) => {
  if (period === "today") {
    return getUtcDayStart(now);
  }

  if (period === "week") {
    return getUtcWeekStart(now);
  }

  return null;
};

export const toCompletedTimeEntry = (timeEntry: TimeEntry | null) => {
  const durationSeconds = timeEntry
    ? Math.floor(timeEntry.duration_seconds)
    : 0;

  if (
    !timeEntry?.stopped_at ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null;
  }

  return {
    ...timeEntry,
    duration_seconds: durationSeconds,
    stopped_at: timeEntry.stopped_at,
  } satisfies CompletedTimeEntry;
};

export const sortCompletedTimeEntries = (timeEntries: CompletedTimeEntry[]) =>
  [...timeEntries].sort(
    (leftEntry, rightEntry) =>
      getTimeValue(rightEntry.stopped_at) - getTimeValue(leftEntry.stopped_at),
  );

export const filterCompletedTimeEntries = (
  timeEntries: CompletedTimeEntry[],
  filters: TimeEntriesHistoryFilters,
  now = new Date(),
) => {
  const periodStart = getPeriodStart(filters.period, now);

  return sortCompletedTimeEntries(
    timeEntries.filter((timeEntry) => {
      if (filters.cardId && timeEntry.card_id !== filters.cardId) {
        return false;
      }

      if (!periodStart) {
        return true;
      }

      return getTimeValue(timeEntry.stopped_at) >= periodStart;
    }),
  );
};

export const getCompletedTimeEntriesDuration = (
  timeEntries: CompletedTimeEntry[],
) =>
  timeEntries.reduce(
    (totalDurationSeconds, timeEntry) =>
      totalDurationSeconds + timeEntry.duration_seconds,
    0,
  );

export const addCompletedTimeEntryToHistory = (
  timeEntries: CompletedTimeEntry[],
  timeEntry: TimeEntry | null,
) => {
  const completedTimeEntry = toCompletedTimeEntry(timeEntry);

  if (!completedTimeEntry) {
    return timeEntries;
  }

  return sortCompletedTimeEntries([
    completedTimeEntry,
    ...timeEntries.filter(
      (currentEntry) => currentEntry.id !== completedTimeEntry.id,
    ),
  ]);
};

export const replaceCompletedTimeEntryInHistory = (
  timeEntries: CompletedTimeEntry[],
  timeEntry: TimeEntry | null,
) => addCompletedTimeEntryToHistory(timeEntries, timeEntry);

export const removeCompletedTimeEntryFromHistory = (
  timeEntries: CompletedTimeEntry[],
  timeEntryId: string,
) => timeEntries.filter((timeEntry) => timeEntry.id !== timeEntryId);
