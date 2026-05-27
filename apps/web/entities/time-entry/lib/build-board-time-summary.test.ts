import { describe, expect, it } from "vitest";

import {
  addCompletedTimeEntryToSummary,
  buildBoardTimeSummary,
  createEmptyBoardTimeSummary,
} from "./build-board-time-summary";
import { type TimeEntry } from "../model/types";

const timestamp = "2026-05-27T10:00:00.000Z";

const createTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  board_id: "board-1",
  card_id: "card-1",
  created_at: timestamp,
  duration_seconds: 60,
  id: "entry-1",
  started_at: "2026-05-27T09:55:00.000Z",
  stopped_at: timestamp,
  updated_at: timestamp,
  user_id: "user-1",
  ...overrides,
});

describe("board time summary", () => {
  it("creates an empty board summary", () => {
    expect(createEmptyBoardTimeSummary("board-1")).toEqual({
      boardId: "board-1",
      cardSummaries: [],
      completedEntryCount: 0,
      recentEntries: [],
      totalDurationSeconds: 0,
    });
  });

  it("aggregates completed entries by card", () => {
    const summary = buildBoardTimeSummary("board-1", [
      createTimeEntry({
        card_id: "card-1",
        duration_seconds: 45,
        id: "entry-1",
        stopped_at: "2026-05-27T10:00:00.000Z",
      }),
      createTimeEntry({
        card_id: "card-2",
        duration_seconds: 120,
        id: "entry-2",
        stopped_at: "2026-05-27T10:05:00.000Z",
      }),
      createTimeEntry({
        card_id: "card-1",
        duration_seconds: 15,
        id: "entry-3",
        stopped_at: "2026-05-27T10:10:00.000Z",
      }),
    ]);

    expect(summary.totalDurationSeconds).toBe(180);
    expect(summary.completedEntryCount).toBe(3);
    expect(summary.cardSummaries).toEqual([
      {
        cardId: "card-2",
        completedEntryCount: 1,
        lastStoppedAt: "2026-05-27T10:05:00.000Z",
        totalDurationSeconds: 120,
      },
      {
        cardId: "card-1",
        completedEntryCount: 2,
        lastStoppedAt: "2026-05-27T10:10:00.000Z",
        totalDurationSeconds: 60,
      },
    ]);
    expect(summary.recentEntries.map((entry) => entry.id)).toEqual([
      "entry-3",
      "entry-2",
      "entry-1",
    ]);
  });

  it("ignores active and empty completed entries", () => {
    const summary = buildBoardTimeSummary("board-1", [
      createTimeEntry({
        duration_seconds: 0,
        id: "entry-1",
      }),
      createTimeEntry({
        id: "entry-2",
        stopped_at: null,
      }),
      createTimeEntry({
        duration_seconds: 30,
        id: "entry-3",
      }),
    ]);

    expect(summary.totalDurationSeconds).toBe(30);
    expect(summary.completedEntryCount).toBe(1);
    expect(summary.recentEntries.map((entry) => entry.id)).toEqual(["entry-3"]);
  });

  it("ignores entries from another board", () => {
    const summary = buildBoardTimeSummary("board-1", [
      createTimeEntry({
        board_id: "board-2",
        duration_seconds: 90,
        id: "entry-1",
      }),
    ]);

    expect(summary.totalDurationSeconds).toBe(0);
    expect(summary.completedEntryCount).toBe(0);
  });

  it("adds a completed entry to an existing summary", () => {
    const summary = buildBoardTimeSummary("board-1", [
      createTimeEntry({
        duration_seconds: 45,
        id: "entry-1",
      }),
    ]);
    const result = addCompletedTimeEntryToSummary(
      summary,
      createTimeEntry({
        duration_seconds: 75,
        id: "entry-2",
        stopped_at: "2026-05-27T10:10:00.000Z",
      }),
    );

    expect(result.totalDurationSeconds).toBe(120);
    expect(result.completedEntryCount).toBe(2);
    expect(result.cardSummaries[0]).toMatchObject({
      cardId: "card-1",
      completedEntryCount: 2,
      totalDurationSeconds: 120,
    });
    expect(result.recentEntries.map((entry) => entry.id)).toEqual([
      "entry-2",
      "entry-1",
    ]);
  });

  it("does not add the same recent entry twice", () => {
    const timeEntry = createTimeEntry({
      id: "entry-1",
    });
    const summary = buildBoardTimeSummary("board-1", [timeEntry]);
    const result = addCompletedTimeEntryToSummary(summary, timeEntry);

    expect(result).toEqual(summary);
  });
});
