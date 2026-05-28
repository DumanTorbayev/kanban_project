import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

type CsvCell = number | string | null | undefined;

type BuildTimeReportCsvInput = {
  cardTitlesById: Record<string, string>;
  timeEntries: CompletedTimeEntry[];
};

const headers = [
  "Card",
  "Card ID",
  "Started At UTC",
  "Stopped At UTC",
  "Duration Seconds",
  "Duration",
  "Entry ID",
];

const escapeCsvCell = (cell: CsvCell) => {
  const value = String(cell ?? "");

  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
};

const toUtcIsoString = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
};

const toCsvRow = (cells: CsvCell[]) => cells.map(escapeCsvCell).join(",");

export const buildTimeReportCsv = ({
  cardTitlesById,
  timeEntries,
}: BuildTimeReportCsvInput) => {
  const rows = timeEntries.map((timeEntry) =>
    toCsvRow([
      cardTitlesById[timeEntry.card_id] ?? "Untitled card",
      timeEntry.card_id,
      toUtcIsoString(timeEntry.started_at),
      toUtcIsoString(timeEntry.stopped_at),
      timeEntry.duration_seconds,
      formatTimerDuration(timeEntry.duration_seconds),
      timeEntry.id,
    ]),
  );

  return [toCsvRow(headers), ...rows].join("\n");
};

export const getTimeReportFileName = (date = new Date()) => {
  if (Number.isNaN(date.getTime())) {
    return "time-report-unknown-date.csv";
  }

  return `time-report-${date.toISOString().slice(0, 10)}.csv`;
};
