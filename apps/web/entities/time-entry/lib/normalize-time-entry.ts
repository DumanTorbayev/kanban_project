import { type TimeEntry } from "../model/types";

export type TimeEntryRow = Omit<TimeEntry, "duration_seconds"> & {
  duration_seconds: number | string;
};

const normalizeDurationSeconds = (durationSeconds: number | string) => {
  const parsedDurationSeconds = Number(durationSeconds);

  if (!Number.isFinite(parsedDurationSeconds) || parsedDurationSeconds < 0) {
    return 0;
  }

  return Math.floor(parsedDurationSeconds);
};

export const normalizeTimeEntry = (timeEntry: TimeEntryRow): TimeEntry => ({
  ...timeEntry,
  duration_seconds: normalizeDurationSeconds(timeEntry.duration_seconds),
});
