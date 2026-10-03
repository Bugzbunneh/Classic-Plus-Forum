import type { GameIconName } from "@/components/game-icon";

export type Milestone = {
  label: string;
  threshold: number;
  icon: GameIconName;
  /** WoW item-quality name, for flavour text in the tooltip. */
  quality: string;
  /** Text colour for that quality. */
  textClass: string;
  /** Border and background tint for that quality. */
  frameClass: string;
};

// Ascending order - based on total posts + comments. Colours follow WoW's
// item rarity: uncommon (green), rare (blue), legendary (orange).
export const MILESTONES: Milestone[] = [
  {
    threshold: 10,
    label: "Adventurer",
    icon: "compass",
    quality: "Uncommon",
    textClass: "text-quality-uncommon",
    frameClass: "border-quality-uncommon/40 bg-quality-uncommon/10",
  },
  {
    threshold: 50,
    label: "Veteran",
    icon: "griffin-shield",
    quality: "Rare",
    textClass: "text-quality-rare",
    frameClass: "border-quality-rare/40 bg-quality-rare/10",
  },
  {
    threshold: 200,
    label: "Legend",
    icon: "laurel-crown",
    quality: "Legendary",
    textClass: "text-quality-legendary",
    frameClass: "border-quality-legendary/40 bg-quality-legendary/10",
  },
];

export function getMilestoneBadge(totalCount: number): Milestone | null {
  return [...MILESTONES].reverse().find((m) => totalCount >= m.threshold) ?? null;
}

export function milestoneUnlockText(milestone: Milestone, totalCount: number): string {
  if (totalCount >= milestone.threshold) {
    return `Earned at ${milestone.threshold}+ posts & comments`;
  }
  const remaining = milestone.threshold - totalCount;
  return `Reach ${milestone.threshold} posts & comments to unlock (${remaining} to go)`;
}

/** 0-100, how far `totalCount` is towards unlocking `milestone`. */
export function milestoneProgress(milestone: Milestone, totalCount: number): number {
  return Math.min(100, Math.round((totalCount / milestone.threshold) * 100));
}
