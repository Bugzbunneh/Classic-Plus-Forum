import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("What's up?! Class & Gameplay")).toBe(
      "what-s-up-class-gameplay",
    );
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--already-hyphenated--")).toBe("already-hyphenated");
  });

  it("caps length at 60 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBe(60);
  });

  it("returns an empty string for input with no valid characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("appends a random suffix to the base slug", () => {
    const result = uniqueSlug("My Post Title");
    expect(result).toMatch(/^my-post-title-[a-z0-9]{6}$/);
  });

  it("falls back to 'post' when the title has no valid characters", () => {
    const result = uniqueSlug("???");
    expect(result).toMatch(/^post-[a-z0-9]{6}$/);
  });

  it("produces different slugs for the same title", () => {
    const first = uniqueSlug("Same Title");
    const second = uniqueSlug("Same Title");
    expect(first).not.toBe(second);
  });
});
