import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

import {
  formatTimeReportDateTime,
  getDateFileStamp,
} from "./time-report-formatters";

type CsvCell = number | string | null | undefined;

type BuildTimeReportCsvInput = {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
};

const delimiter = ";";

const headers = [
  "Card",
  "Started At (UTC)",
  "Stopped At (UTC)",
  "Duration",
  "Duration Seconds",
];

const escapeCsvCell = (cell: CsvCell) => {
  const value = String(cell ?? "");

  if (!/[";\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
};

const toCsvRow = (cells: CsvCell[]) => cells.map(escapeCsvCell).join(delimiter);

export const buildTimeReportCsv = ({
  cardTitlesById,
  timeEntries,
}: BuildTimeReportCsvInput) => {
  const rows = timeEntries.map((timeEntry) =>
    toCsvRow([
      cardTitlesById[timeEntry.card_id] ?? "Untitled card",
      formatTimeReportDateTime(timeEntry.started_at),
      formatTimeReportDateTime(timeEntry.stopped_at),
      formatTimerDuration(timeEntry.duration_seconds),
      timeEntry.duration_seconds,
    ]),
  );

  return [`sep=${delimiter}`, toCsvRow(headers), ...rows].join("\n");
};

export const getTimeReportFileName = (date = new Date()) => {
  return `time-report-${getDateFileStamp(date)}.csv`;
};
