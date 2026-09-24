import { describe, expect, it } from "vitest";
import { getPageRange, getTotalPages } from "./pagination";

describe("getPageRange", () => {
  it("defaults to page 1 when no param is given", () => {
    expect(getPageRange(undefined, 20)).toEqual({ page: 1, from: 0, to: 19 });
  });

  it("computes the range for a later page", () => {
    expect(getPageRange("3", 20)).toEqual({ page: 3, from: 40, to: 59 });
  });

  it("clamps invalid or negative page numbers to 1", () => {
    expect(getPageRange("0", 20)).toEqual({ page: 1, from: 0, to: 19 });
    expect(getPageRange("-5", 20)).toEqual({ page: 1, from: 0, to: 19 });
    expect(getPageRange("not-a-number", 20)).toEqual({ page: 1, from: 0, to: 19 });
  });
});

describe("getTotalPages", () => {
  it("is always at least 1, even with zero results", () => {
    expect(getTotalPages(0, 20)).toBe(1);
    expect(getTotalPages(null, 20)).toBe(1);
  });

  it("rounds up to cover a partial last page", () => {
    expect(getTotalPages(21, 20)).toBe(2);
    expect(getTotalPages(40, 20)).toBe(2);
    expect(getTotalPages(41, 20)).toBe(3);
  });
});
