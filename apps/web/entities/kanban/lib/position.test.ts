import { describe, expect, it } from "vitest";

import { getNextPosition } from "./position";

describe("getNextPosition", () => {
  it("starts a new ordered list at the default position step", () => {
    expect(getNextPosition(null)).toBe(1024);
    expect(getNextPosition(undefined)).toBe(1024);
  });

  it("adds the position step to numeric values", () => {
    expect(getNextPosition(1024)).toBe(2048);
    expect(getNextPosition(2048)).toBe(3072);
  });

  it("accepts numeric strings from Supabase payloads", () => {
    expect(getNextPosition("3072")).toBe(4096);
  });

  it("falls back to the first position for invalid values", () => {
    expect(getNextPosition("not-a-number")).toBe(1024);
  });
});
