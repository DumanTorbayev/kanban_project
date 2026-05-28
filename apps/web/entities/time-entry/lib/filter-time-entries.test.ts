import { describe, expect, it } from "vitest";

import {
  addCompletedTimeEntryToHistory,
  filterCompletedTimeEntries,
  getCompletedTimeEntriesDuration,
  removeCompletedTimeEntryFromHistory,
  replaceCompletedTimeEntryInHistory,
  sortCompletedTimeEntries,
} from "./filter-time-entries";
import { type CompletedTimeEntry, type TimeEntry } from "../model/types";

const timestamp = "2026-05-27T12:00:00.000Z";

const createTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  board_id: "board-1",
  card_id: "card-1",
  created_at: timestamp,
  duration_seconds: 60,
  id: "entry-1",
  started_at: "2026-05-27T11:55:00.000Z",
  stopped_at: timestamp,
  updated_at: timestamp,
  user_id: "user-1",
  ...overrides,
});

const createCompletedTimeEntry = (
  overrides: Partial<CompletedTimeEntry> = {},
): CompletedTimeEntry => ({
  ...createTimeEntry(),
  stopped_at: timestamp,
  ...overrides,
});

describe("time entry history helpers", () => {
  it("sorts completed entries by latest stopped time", () => {
    const result = sortCompletedTimeEntries([
      createCompletedTimeEntry({
        id: "entry-1",
        stopped_at: "2026-05-27T10:00:00.000Z",
      }),
      createCompletedTimeEntry({
        id: "entry-2",
        stopped_at: "2026-05-27T12:00:00.000Z",
      }),
    ]);

    expect(result.map((entry) => entry.id)).toEqual(["entry-2", "entry-1"]);
  });

  it("filters entries by card", () => {
    const result = filterCompletedTimeEntries(
      [
        createCompletedTimeEntry({
          card_id: "card-1",
          id: "entry-1",
        }),
        createCompletedTimeEntry({
          card_id: "card-2",
          id: "entry-2",
        }),
      ],
      {
        cardId: "card-2",
        period: "all",
      },
    );

    expect(result.map((entry) => entry.id)).toEqual(["entry-2"]);
  });

  it("filters entries completed today", () => {
    const result = filterCompletedTimeEntries(
      [
        createCompletedTimeEntry({
          id: "entry-1",
          stopped_at: "2026-05-26T23:59:59.000Z",
        }),
        createCompletedTimeEntry({
          id: "entry-2",
          stopped_at: "2026-05-27T00:00:00.000Z",
        }),
      ],
      {
        cardId: null,
        period: "today",
      },
      new Date("2026-05-27T12:00:00.000Z"),
    );

    expect(result.map((entry) => entry.id)).toEqual(["entry-2"]);
  });

  it("filters entries completed this week", () => {
    const result = filterCompletedTimeEntries(
      [
        createCompletedTimeEntry({
          id: "entry-1",
          stopped_at: "2026-05-24T23:59:59.000Z",
        }),
        createCompletedTimeEntry({
          id: "entry-2",
          stopped_at: "2026-05-25T00:00:00.000Z",
        }),
        createCompletedTimeEntry({
          id: "entry-3",
          stopped_at: "2026-05-27T12:00:00.000Z",
        }),
      ],
      {
        cardId: null,
        period: "week",
      },
      new Date("2026-05-27T12:00:00.000Z"),
    );

    expect(result.map((entry) => entry.id)).toEqual(["entry-3", "entry-2"]);
  });

  it("adds a completed entry to history without duplicates", () => {
    const currentEntry = createCompletedTimeEntry({
      id: "entry-1",
      stopped_at: "2026-05-27T10:00:00.000Z",
    });
    const nextEntry = createCompletedTimeEntry({
      id: "entry-2",
      stopped_at: "2026-05-27T12:00:00.000Z",
    });
    const result = addCompletedTimeEntryToHistory(
      addCompletedTimeEntryToHistory([currentEntry], nextEntry),
      nextEntry,
    );

    expect(result.map((entry) => entry.id)).toEqual(["entry-2", "entry-1"]);
  });

  it("replaces a completed entry in history", () => {
    const result = replaceCompletedTimeEntryInHistory(
      [
        createCompletedTimeEntry({
          duration_seconds: 60,
          id: "entry-1",
        }),
      ],
      createTimeEntry({
        duration_seconds: 90,
        id: "entry-1",
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.duration_seconds).toBe(90);
  });

  it("removes a completed entry from history", () => {
    const result = removeCompletedTimeEntryFromHistory(
      [
        createCompletedTimeEntry({
          id: "entry-1",
        }),
        createCompletedTimeEntry({
          id: "entry-2",
        }),
      ],
      "entry-1",
    );

    expect(result.map((entry) => entry.id)).toEqual(["entry-2"]);
  });

  it("keeps active entries out of history", () => {
    const result = addCompletedTimeEntryToHistory(
      [],
      createTimeEntry({
        stopped_at: null,
      }),
    );

    expect(result).toEqual([]);
  });

  it("normalizes added history duration", () => {
    const result = addCompletedTimeEntryToHistory(
      [],
      createTimeEntry({
        duration_seconds: 30.8,
      }),
    );

    expect(result[0]?.duration_seconds).toBe(30);
  });

  it("sums completed history durations", () => {
    expect(
      getCompletedTimeEntriesDuration([
        createCompletedTimeEntry({
          duration_seconds: 30,
          id: "entry-1",
        }),
        createCompletedTimeEntry({
          duration_seconds: 45,
          id: "entry-2",
        }),
      ]),
    ).toBe(75);
  });
});
