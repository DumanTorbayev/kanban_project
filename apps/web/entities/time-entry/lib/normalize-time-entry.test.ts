import { describe, expect, it } from "vitest";

import { normalizeTimeEntry, type TimeEntryRow } from "./normalize-time-entry";

const baseTimeEntry: TimeEntryRow = {
  board_id: "board-1",
  card_id: "card-1",
  created_at: "2026-05-28T10:00:00.000Z",
  duration_seconds: 0,
  id: "entry-1",
  started_at: "2026-05-28T10:00:00.000Z",
  stopped_at: "2026-05-28T10:05:00.000Z",
  updated_at: "2026-05-28T10:05:00.000Z",
  user_id: "user-1",
};

describe("normalizeTimeEntry", () => {
  it("converts string duration values to numbers", () => {
    expect(
      normalizeTimeEntry({
        ...baseTimeEntry,
        duration_seconds: "125",
      }).duration_seconds,
    ).toBe(125);
  });

  it("floors fractional duration values", () => {
    expect(
      normalizeTimeEntry({
        ...baseTimeEntry,
        duration_seconds: 125.9,
      }).duration_seconds,
    ).toBe(125);
  });

  it("normalizes invalid and negative duration values to zero", () => {
    expect(
      normalizeTimeEntry({
        ...baseTimeEntry,
        duration_seconds: "not-a-number",
      }).duration_seconds,
    ).toBe(0);
    expect(
      normalizeTimeEntry({
        ...baseTimeEntry,
        duration_seconds: -1,
      }).duration_seconds,
    ).toBe(0);
  });
});
