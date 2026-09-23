import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./format-relative-time";

describe("formatRelativeTime", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for under a minute", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 30 * 1000))).toBe("just now");
  });

  it("formats minutes", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60 * 1000))).toBe("5m ago");
  });

  it("formats hours", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 60 * 60 * 1000))).toBe("3h ago");
  });

  it("formats days", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))).toBe("2d ago");
  });

  it("formats months", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000))).toBe("2mo ago");
  });

  it("formats years", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000))).toBe("1y ago");
  });
});
