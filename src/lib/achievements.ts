export type Milestone = { label: string; colorClass: string };

// Checked highest-threshold-first; based on total posts + comments.
const MILESTONES: (Milestone & { threshold: number })[] = [
  { threshold: 200, label: "Legend", colorClass: "border-gold-600 text-gold-400" },
  { threshold: 50, label: "Veteran", colorClass: "border-green-600 text-green-400" },
  { threshold: 10, label: "Adventurer", colorClass: "border-charcoal-500 text-charcoal-300" },
];

export function getMilestoneBadge(totalCount: number): Milestone | null {
  return MILESTONES.find((m) => totalCount >= m.threshold) ?? null;
}
