import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

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

const padDatePart = (value: number) => value.toString().padStart(2, "0");

const escapeCsvCell = (cell: CsvCell) => {
  const value = String(cell ?? "");

  if (!/[";\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
};

const formatUtcDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return [
    date.getUTCFullYear(),
    "-",
    padDatePart(date.getUTCMonth() + 1),
    "-",
    padDatePart(date.getUTCDate()),
    " ",
    padDatePart(date.getUTCHours()),
    ":",
    padDatePart(date.getUTCMinutes()),
    ":",
    padDatePart(date.getUTCSeconds()),
  ].join("");
};

const toCsvRow = (cells: CsvCell[]) => cells.map(escapeCsvCell).join(delimiter);

export const buildTimeReportCsv = ({
  cardTitlesById,
  timeEntries,
}: BuildTimeReportCsvInput) => {
  const rows = timeEntries.map((timeEntry) =>
    toCsvRow([
      cardTitlesById[timeEntry.card_id] ?? "Untitled card",
      formatUtcDateTime(timeEntry.started_at),
      formatUtcDateTime(timeEntry.stopped_at),
      formatTimerDuration(timeEntry.duration_seconds),
      timeEntry.duration_seconds,
    ]),
  );

  return [`sep=${delimiter}`, toCsvRow(headers), ...rows].join("\n");
};

export const getTimeReportFileName = (date = new Date()) => {
  if (Number.isNaN(date.getTime())) {
    return "time-report-unknown-date.csv";
  }

  return `time-report-${date.toISOString().slice(0, 10)}.csv`;
};
