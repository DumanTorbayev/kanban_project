import { describe, expect, it } from "vitest";

import { formatTimerDuration } from "./format-timer-duration";

describe("formatTimerDuration", () => {
  it("formats short durations as minutes and seconds", () => {
    expect(formatTimerDuration(0)).toBe("00:00");
    expect(formatTimerDuration(5)).toBe("00:05");
    expect(formatTimerDuration(65)).toBe("01:05");
  });

  it("formats long durations with hours", () => {
    expect(formatTimerDuration(3661)).toBe("1:01:01");
  });

  it("normalizes invalid negative durations to zero", () => {
    expect(formatTimerDuration(-15)).toBe("00:00");
  });
});
