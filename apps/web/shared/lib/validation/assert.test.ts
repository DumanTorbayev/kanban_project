import { describe, expect, it } from "vitest";

import {
  assertMaxLength,
  assertNonNegativeNumber,
  assertRequired,
} from "./assert";

describe("assertRequired", () => {
  it("passes for non-empty values", () => {
    expect(() => assertRequired("title", "Required")).not.toThrow();
  });

  it("throws for empty or whitespace-only values", () => {
    expect(() => assertRequired("", "Required")).toThrow("Required");
    expect(() => assertRequired("   ", "Required")).toThrow("Required");
  });
});

describe("assertMaxLength", () => {
  it("passes when within the limit", () => {
    expect(() => assertMaxLength("abc", 3, "Too long")).not.toThrow();
  });

  it("ignores surrounding whitespace", () => {
    expect(() => assertMaxLength("  abc  ", 3, "Too long")).not.toThrow();
  });

  it("throws when the trimmed value exceeds the limit", () => {
    expect(() => assertMaxLength("abcd", 3, "Too long")).toThrow("Too long");
  });
});

describe("assertNonNegativeNumber", () => {
  it("passes for zero and positive finite numbers", () => {
    expect(() => assertNonNegativeNumber(0, "Invalid")).not.toThrow();
    expect(() => assertNonNegativeNumber(1024, "Invalid")).not.toThrow();
  });

  it("throws for negative or non-finite numbers", () => {
    expect(() => assertNonNegativeNumber(-1, "Invalid")).toThrow("Invalid");
    expect(() => assertNonNegativeNumber(Number.NaN, "Invalid")).toThrow(
      "Invalid",
    );
    expect(() =>
      assertNonNegativeNumber(Number.POSITIVE_INFINITY, "Invalid"),
    ).toThrow("Invalid");
  });
});
