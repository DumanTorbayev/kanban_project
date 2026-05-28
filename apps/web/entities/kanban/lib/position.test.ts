import { describe, expect, it } from "vitest";

import {
  getNextPosition,
  getPositionBetween,
  MIN_POSITION_GAP,
  needsRenormalization,
  renormalizePositions,
} from "./position";

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

describe("getPositionBetween", () => {
  it("returns the midpoint between two neighbours", () => {
    expect(getPositionBetween(1024, 2048)).toBe(1536);
  });

  it("appends after the previous neighbour when there is no next", () => {
    expect(getPositionBetween(1024, undefined)).toBe(2048);
  });

  it("prepends before the next neighbour when there is no previous", () => {
    expect(getPositionBetween(undefined, 1024)).toBe(512);
  });

  it("falls back to the first position for an empty list", () => {
    expect(getPositionBetween(undefined, undefined)).toBe(1024);
  });
});

describe("needsRenormalization", () => {
  it("returns false for evenly spaced positions", () => {
    expect(needsRenormalization([1024, 2048, 3072])).toBe(false);
  });

  it("returns false for a list with fewer than two items", () => {
    expect(needsRenormalization([])).toBe(false);
    expect(needsRenormalization([1024])).toBe(false);
  });

  it("returns true once neighbours drift below the minimum gap", () => {
    expect(needsRenormalization([1024, 1024 + MIN_POSITION_GAP / 2])).toBe(
      true,
    );
  });
});

describe("renormalizePositions", () => {
  it("produces evenly spaced positions for the given count", () => {
    expect(renormalizePositions(3)).toEqual([1024, 2048, 3072]);
  });

  it("returns an empty list for non-positive counts", () => {
    expect(renormalizePositions(0)).toEqual([]);
    expect(renormalizePositions(-2)).toEqual([]);
  });
});
