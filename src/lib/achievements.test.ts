import { describe, expect, it } from "vitest";
import {
  MILESTONES,
  getMilestoneBadge,
  milestoneProgress,
  milestoneUnlockText,
} from "./achievements";

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

describe("milestoneUnlockText", () => {
  const veteran = MILESTONES.find((m) => m.label === "Veteran")!;

  it("describes how many are needed when locked", () => {
    expect(milestoneUnlockText(veteran, 30)).toBe(
      "Reach 50 posts & comments to unlock (20 to go)",
    );
  });

  it("confirms it's earned once the threshold is met", () => {
    expect(milestoneUnlockText(veteran, 50)).toBe("Earned at 50+ posts & comments");
    expect(milestoneUnlockText(veteran, 75)).toBe("Earned at 50+ posts & comments");
  });
});

describe("milestoneProgress", () => {
  const veteran = MILESTONES.find((m) => m.label === "Veteran")!;

  it("is a rounded percentage towards the threshold", () => {
    expect(milestoneProgress(veteran, 0)).toBe(0);
    expect(milestoneProgress(veteran, 17)).toBe(34);
  });

  it("caps at 100 once earned", () => {
    expect(milestoneProgress(veteran, 50)).toBe(100);
    expect(milestoneProgress(veteran, 500)).toBe(100);
  });
});
