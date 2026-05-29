import { formatTimerDuration } from "@/entities/time-entry/lib/format-timer-duration";
import {
  type CompletedTimeEntry,
  type TimeReportPeriod,
} from "@/entities/time-entry/model/types";

import {
  formatTimeReportDateTime,
  getDateFileStamp,
} from "./time-report-formatters";

type BuildTimeReportPdfDataInput = {
  cardTitlesById: Record<string, string>;
  generatedAt?: Date;
  selectedCardId: string | null;
  selectedPeriod: TimeReportPeriod;
  timeEntries: CompletedTimeEntry[];
};

export type TimeReportPdfRow = {
  cardTitle: string;
  duration: string;
  startedAt: string;
  stoppedAt: string;
};

export type TimeReportPdfData = {
  filters: {
    card: string;
    period: string;
  };
  generatedAt: string;
  rows: TimeReportPdfRow[];
  summary: {
    averageSession: string;
    sessions: string;
    totalTracked: string;
  };
};

const periodLabels: Record<TimeReportPeriod, string> = {
  all: "All time",
  today: "Today",
  week: "This week",
};

export const getTimeReportPdfFileName = (date = new Date()) =>
  `time-report-${getDateFileStamp(date)}.pdf`;

export const buildTimeReportPdfData = ({
  cardTitlesById,
  generatedAt = new Date(),
  selectedCardId,
  selectedPeriod,
  timeEntries,
}: BuildTimeReportPdfDataInput): TimeReportPdfData => {
  const totalDurationSeconds = timeEntries.reduce(
    (totalDuration, timeEntry) => totalDuration + timeEntry.duration_seconds,
    0,
  );
  const averageDurationSeconds =
    timeEntries.length > 0
      ? Math.floor(totalDurationSeconds / timeEntries.length)
      : 0;

  return {
    filters: {
      card: selectedCardId
        ? (cardTitlesById[selectedCardId] ?? "Untitled card")
        : "All cards",
      period: periodLabels[selectedPeriod],
    },
    generatedAt: `${formatTimeReportDateTime(generatedAt.toISOString())} UTC`,
    rows: timeEntries.map((timeEntry) => ({
      cardTitle: cardTitlesById[timeEntry.card_id] ?? "Untitled card",
      duration: formatTimerDuration(timeEntry.duration_seconds),
      startedAt: formatTimeReportDateTime(timeEntry.started_at),
      stoppedAt: formatTimeReportDateTime(timeEntry.stopped_at),
    })),
    summary: {
      averageSession: formatTimerDuration(averageDurationSeconds),
      sessions: String(timeEntries.length),
      totalTracked: formatTimerDuration(totalDurationSeconds),
    },
  };
};
