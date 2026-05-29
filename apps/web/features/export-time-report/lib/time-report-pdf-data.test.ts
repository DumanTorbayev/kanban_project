import { describe, expect, it } from "vitest";

import {
  type CompletedTimeEntry,
  type TimeReportPeriod,
} from "@/entities/time-entry/model/types";

import {
  buildTimeReportPdfData,
  getTimeReportPdfFileName,
} from "./time-report-pdf-data";

const timestamp = "2026-05-29T12:00:00.000Z";

const createTimeEntry = (
  overrides: Partial<CompletedTimeEntry> = {},
): CompletedTimeEntry => ({
  board_id: "board-1",
  card_id: "card-1",
  created_at: timestamp,
  duration_seconds: 90,
  id: "entry-1",
  started_at: "2026-05-29T11:58:30.000Z",
  stopped_at: timestamp,
  updated_at: timestamp,
  user_id: "user-1",
  ...overrides,
});

const buildData = (
  overrides: {
    selectedCardId?: string | null;
    selectedPeriod?: TimeReportPeriod;
    timeEntries?: CompletedTimeEntry[];
  } = {},
) =>
  buildTimeReportPdfData({
    cardTitlesById: {
      "card-1": "Implement reporting",
      "card-2": "Review analytics",
    },
    generatedAt: new Date("2026-05-29T18:30:00.000Z"),
    selectedCardId: overrides.selectedCardId ?? null,
    selectedPeriod: overrides.selectedPeriod ?? "all",
    timeEntries: overrides.timeEntries ?? [createTimeEntry()],
  });

describe("time report PDF data", () => {
  it("builds report metadata, summary, and rows", () => {
    const data = buildData({
      timeEntries: [
        createTimeEntry({
          duration_seconds: 90,
          id: "entry-1",
        }),
        createTimeEntry({
          card_id: "card-2",
          duration_seconds: 30,
          id: "entry-2",
          started_at: "2026-05-29T12:10:00.000Z",
          stopped_at: "2026-05-29T12:10:30.000Z",
        }),
      ],
    });

    expect(data.filters).toEqual({
      card: "All cards",
      period: "All time",
    });
    expect(data.generatedAt).toBe("2026-05-29 18:30:00 UTC");
    expect(data.summary).toEqual({
      averageSession: "01:00",
      sessions: "2",
      totalTracked: "02:00",
    });
    expect(data.rows).toEqual([
      {
        cardTitle: "Implement reporting",
        duration: "01:30",
        startedAt: "2026-05-29 11:58:30",
        stoppedAt: "2026-05-29 12:00:00",
      },
      {
        cardTitle: "Review analytics",
        duration: "00:30",
        startedAt: "2026-05-29 12:10:00",
        stoppedAt: "2026-05-29 12:10:30",
      },
    ]);
  });

  it("includes selected filters in the report", () => {
    expect(
      buildData({
        selectedCardId: "card-1",
        selectedPeriod: "week",
      }).filters,
    ).toEqual({
      card: "Implement reporting",
      period: "This week",
    });
  });

  it("creates a date-based PDF file name", () => {
    expect(getTimeReportPdfFileName(new Date("2026-05-29T18:00:00.000Z"))).toBe(
      "time-report-2026-05-29.pdf",
    );
  });
});
