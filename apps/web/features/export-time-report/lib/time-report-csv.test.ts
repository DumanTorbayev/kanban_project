import { describe, expect, it } from "vitest";

import { type CompletedTimeEntry } from "@/entities/time-entry/model/types";

import { buildTimeReportCsv, getTimeReportFileName } from "./time-report-csv";

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

describe("time report CSV", () => {
  it("builds a CSV with report headers and time entry rows", () => {
    const result = buildTimeReportCsv({
      cardTitlesById: {
        "card-1": "Implement reporting",
      },
      timeEntries: [createTimeEntry()],
    });

    expect(result).toBe(
      [
        "sep=;",
        "Card;Started At (UTC);Stopped At (UTC);Duration;Duration Seconds",
        "Implement reporting;2026-05-29 11:58:30;2026-05-29 12:00:00;01:30;90",
      ].join("\n"),
    );
  });

  it("escapes titles that contain CSV control characters", () => {
    const result = buildTimeReportCsv({
      cardTitlesById: {
        "card-1": 'Review "CSV"; export',
      },
      timeEntries: [createTimeEntry()],
    });

    expect(result.split("\n")[2]).toContain(
      '"Review ""CSV""; export";2026-05-29',
    );
  });

  it("falls back to untitled card when a title is missing", () => {
    const result = buildTimeReportCsv({
      cardTitlesById: {},
      timeEntries: [createTimeEntry()],
    });

    expect(result.split("\n")[2]?.startsWith("Untitled card;2026")).toBe(true);
  });

  it("creates a date-based report file name", () => {
    expect(getTimeReportFileName(new Date("2026-05-29T18:00:00.000Z"))).toBe(
      "time-report-2026-05-29.csv",
    );
  });
});
