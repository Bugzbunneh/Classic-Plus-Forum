import { describe, expect, it } from "vitest";
import { getMilestoneBadge } from "./achievements";

describe("getMilestoneBadge", () => {
  it("returns null below the first threshold", () => {
    expect(getMilestoneBadge(0)).toBeNull();
    expect(getMilestoneBadge(9)).toBeNull();
  });

  it("returns Adventurer at 10", () => {
    expect(getMilestoneBadge(10)?.label).toBe("Adventurer");
    expect(getMilestoneBadge(49)?.label).toBe("Adventurer");
  });

  it("returns Veteran at 50", () => {
    expect(getMilestoneBadge(50)?.label).toBe("Veteran");
    expect(getMilestoneBadge(199)?.label).toBe("Veteran");
  });

  it("returns Legend at 200", () => {
    expect(getMilestoneBadge(200)?.label).toBe("Legend");
    expect(getMilestoneBadge(10000)?.label).toBe("Legend");
  });
});
