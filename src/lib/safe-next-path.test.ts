import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("keeps same-site paths, including query and hash", () => {
    expect(safeNextPath("/c/general/some-post?commentsPage=2#reply")).toBe(
      "/c/general/some-post?commentsPage=2#reply",
    );
  });

  it("falls back to / when nothing is given", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it.each([
    ["an absolute URL", "https://evil.example"],
    ["a protocol-relative URL", "//evil.example"],
    ["a backslash trick", "/\\evil.example"],
    ["a tab trick", "/\t/evil.example"],
    ["a userinfo trick", "@evil.example"],
    ["a host-suffix trick", ".evil.example"],
    ["a javascript: URL", "javascript:alert(1)"],
  ])("rejects %s", (_label, value) => {
    expect(safeNextPath(value)).toBe("/");
  });
});
