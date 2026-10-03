import { Lock } from "lucide-react";
import { GameIcon } from "@/components/game-icon";
import { milestoneProgress, milestoneUnlockText, type Milestone } from "@/lib/achievements";
import { staggerStyle } from "@/lib/stagger";

/** Compact inline badge, for author boxes. */
export function AchievementBadge({ milestone }: { milestone: Milestone }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${milestone.frameClass} ${milestone.textClass}`}
    >
      <GameIcon name={milestone.icon} className="size-3.5" />
      {milestone.label}
    </span>
  );
}

/**
 * Large achievement tile for profile pages. Hover or focus shows a WoW-style
 * item tooltip; locked tiles are greyed out with a progress bar.
 */
export function AchievementTile({
  milestone,
  totalActivity,
  index,
}: {
  milestone: Milestone;
  totalActivity: number;
  index: number;
}) {
  const earned = totalActivity >= milestone.threshold;
  const progress = milestoneProgress(milestone, totalActivity);
  const iconFrameClass = earned
    ? `${milestone.frameClass} ${milestone.textClass}`
    : "border-charcoal-700 bg-charcoal-900 text-charcoal-600";

  return (
    <div
      tabIndex={0}
      className="group stagger relative flex w-28 animate-rise-in flex-col items-center gap-2 rounded-xl border border-charcoal-700 bg-charcoal-950/60 p-3 text-center outline-none transition-[transform,border-color] duration-300 ease-spring hover:-translate-y-1 hover:border-gold-700 focus-visible:-translate-y-1 focus-visible:border-gold-500"
      style={staggerStyle(index)}
    >
      <div
        className={`relative flex size-14 items-center justify-center rounded-lg border transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:-rotate-6 ${iconFrameClass}`}
      >
        <GameIcon name={milestone.icon} className="size-9" />
        {!earned && (
          <Lock className="absolute -right-1.5 -bottom-1.5 size-5 rounded-full bg-charcoal-800 p-1 text-charcoal-400" />
        )}
      </div>

      <span className={`text-xs font-semibold ${earned ? "text-charcoal-100" : "text-charcoal-500"}`}>
        {milestone.label}
      </span>

      {!earned && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-charcoal-800">
          <div
            className="h-full animate-progress-fill rounded-full bg-linear-to-r from-green-700 to-green-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div
        role="tooltip"
        className="wow-tooltip pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 translate-y-1 p-3 text-left opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        <p className={`font-semibold ${milestone.textClass}`}>{milestone.label}</p>
        <p className="text-xs text-charcoal-300">{milestone.quality} achievement</p>
        <p className="mt-2 text-xs text-gold-300">{milestoneUnlockText(milestone, totalActivity)}</p>
      </div>
    </div>
  );
}
