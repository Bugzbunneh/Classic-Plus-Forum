export type Milestone = { label: string; threshold: number; colorClass: string };

// Ascending order - based on total posts + comments.
export const MILESTONES: Milestone[] = [
  { threshold: 10, label: "Adventurer", colorClass: "border-charcoal-500 text-charcoal-300" },
  { threshold: 50, label: "Veteran", colorClass: "border-green-600 text-green-400" },
  { threshold: 200, label: "Legend", colorClass: "border-gold-600 text-gold-400" },
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
