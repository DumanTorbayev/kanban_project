import { describe, expect, it } from "vitest";

import { buildTimeAnalytics } from "./build-time-analytics";
import { type CompletedTimeEntry } from "../model/types";

const timestamp = "2026-05-29T12:00:00.000Z";

const createTimeEntry = (
  overrides: Partial<CompletedTimeEntry> = {},
): CompletedTimeEntry => ({
  board_id: "board-1",
  card_id: "card-1",
  created_at: timestamp,
  duration_seconds: 60,
  id: "entry-1",
  started_at: "2026-05-29T11:55:00.000Z",
  stopped_at: timestamp,
  updated_at: timestamp,
  user_id: "user-1",
  ...overrides,
});

describe("time analytics", () => {
  it("returns empty analytics for empty history", () => {
    expect(buildTimeAnalytics([])).toEqual({
      activeCardCount: 0,
      averageDurationSeconds: 0,
      cardBreakdown: [],
      completedEntryCount: 0,
      dailyTrend: [],
      totalDurationSeconds: 0,
    });
  });

  it("aggregates totals, averages, cards, and daily trend", () => {
    const analytics = buildTimeAnalytics([
      createTimeEntry({
        card_id: "card-1",
        duration_seconds: 60,
        id: "entry-1",
        stopped_at: "2026-05-28T12:00:00.000Z",
      }),
      createTimeEntry({
        card_id: "card-2",
        duration_seconds: 120,
        id: "entry-2",
        stopped_at: "2026-05-29T10:00:00.000Z",
      }),
      createTimeEntry({
        card_id: "card-1",
        duration_seconds: 60,
        id: "entry-3",
        stopped_at: "2026-05-29T12:00:00.000Z",
      }),
    ]);

    expect(analytics.totalDurationSeconds).toBe(240);
    expect(analytics.completedEntryCount).toBe(3);
    expect(analytics.averageDurationSeconds).toBe(80);
    expect(analytics.activeCardCount).toBe(2);
    expect(analytics.cardBreakdown).toEqual([
      {
        cardId: "card-1",
        completedEntryCount: 2,
        percentage: 50,
        totalDurationSeconds: 120,
      },
      {
        cardId: "card-2",
        completedEntryCount: 1,
        percentage: 50,
        totalDurationSeconds: 120,
      },
    ]);
    expect(analytics.dailyTrend).toEqual([
      {
        completedEntryCount: 1,
        date: "2026-05-28",
        totalDurationSeconds: 60,
      },
      {
        completedEntryCount: 2,
        date: "2026-05-29",
        totalDurationSeconds: 180,
      },
    ]);
  });
});
