import { describe, expect, it } from "vitest";

import {
  fromDateTimeLocalValue,
  getDurationSeconds,
  toDateTimeLocalValue,
} from "./date-time-local";

describe("time entry datetime-local helpers", () => {
  it("formats an ISO date for a datetime-local input in UTC", () => {
    expect(toDateTimeLocalValue("2026-05-29T10:15:30.000Z")).toBe(
      "2026-05-29T10:15",
    );
  });

  it("parses a datetime-local value as UTC", () => {
    expect(fromDateTimeLocalValue("2026-05-29T10:15")).toBe(
      "2026-05-29T10:15:00.000Z",
    );
  });

  it("calculates duration seconds", () => {
    expect(
      getDurationSeconds(
        "2026-05-29T10:15:00.000Z",
        "2026-05-29T10:16:30.000Z",
      ),
    ).toBe(90);
  });
});
