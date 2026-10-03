"use client";

import { useOptimistic, useState, type CSSProperties } from "react";
import { ThumbsUp, X } from "lucide-react";

const PREVIEW_COUNT = 3;
const PARTICLE_COUNT = 10;
const PARTICLE_DISTANCE = 38;
const PARTICLE_COLORS = ["#e0bd5e", "#74cf92", "#f2d68f", "#a3e6b8"];

type ReactionState = { count: number; hasReacted: boolean };

function toggled(state: ReactionState): ReactionState {
  return {
    hasReacted: !state.hasReacted,
    count: state.count + (state.hasReacted ? -1 : 1),
  };
}

/** Evenly spaced around a circle, alternating near/far for a less uniform burst. */
function particleStyle(index: number): CSSProperties {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const distance = PARTICLE_DISTANCE * (index % 2 === 0 ? 1 : 0.7);
  return {
    "--dx": `${Math.cos(angle) * distance}px`,
    "--dy": `${Math.sin(angle) * distance}px`,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  } as CSSProperties;
}

export function ReactionButton({
  action,
  count,
  hasReacted,
  reactorNames,
}: {
  action: (formData: FormData) => Promise<void>;
  count: number;
  hasReacted: boolean;
  reactorNames: string[];
}) {
  // Flips instantly on click; React drops it once the server's real answer arrives.
  const [reaction, toggleOptimistically] = useOptimistic({ count, hasReacted }, toggled);
  const [pressCount, setPressCount] = useState(0);
  const [burstCount, setBurstCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const preview = reactorNames.slice(0, PREVIEW_COUNT);
  const extra = reactorNames.length - preview.length;

  // State set inside a form action is held back until the action finishes,
  // so the pop and burst are triggered here in the click handler instead.
  function handleClick() {
    setPressCount((n) => n + 1);
    if (!reaction.hasReacted) {
      setBurstCount((n) => n + 1);
    }
  }

  async function submit(formData: FormData) {
    toggleOptimistically(null);
    await action(formData);
  }

  return (
    <div className="group/reaction relative inline-block w-fit">
      <form action={submit}>
        <button
          type="submit"
          onClick={handleClick}
          aria-pressed={reaction.hasReacted}
          aria-label={reaction.hasReacted ? "Remove your thumbs up" : "Give a thumbs up"}
          className={`relative flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-spring active:scale-90 ${
            reaction.hasReacted
              ? "border-green-500/70 bg-green-900/50 text-green-300 shadow-[0_0_18px_-4px_rgb(79_184_114/0.7)]"
              : "border-charcoal-700 bg-charcoal-950/60 text-charcoal-400 hover:-translate-y-0.5 hover:border-gold-700 hover:text-gold-300"
          }`}
        >
          <span key={pressCount} className={`relative ${pressCount > 0 ? "animate-pop" : ""}`}>
            <ThumbsUp className={`size-4 ${reaction.hasReacted ? "fill-green-500/40" : ""}`} aria-hidden="true" />
            {burstCount > 0 &&
              Array.from({ length: PARTICLE_COUNT }, (_, i) => (
                <span
                  key={`${burstCount}-${i}`}
                  className="particle text-xs leading-none drop-shadow-[0_0_4px_currentColor]"
                  style={particleStyle(i)}
                  aria-hidden="true"
                >
                  ✦
                </span>
              ))}
          </span>
          <span key={`count-${reaction.count}`} className="tabular-nums animate-[count-tick_300ms_var(--ease-spring)]">
            {reaction.count}
          </span>
        </button>
      </form>

      {reaction.count > 0 && reactorNames.length > 0 && (
        <div className="wow-tooltip pointer-events-none absolute bottom-full left-0 z-20 mb-2 translate-y-1 px-3 py-2 text-xs whitespace-nowrap opacity-0 transition duration-200 group-hover/reaction:pointer-events-auto group-hover/reaction:translate-y-0 group-hover/reaction:opacity-100 group-focus-within/reaction:pointer-events-auto group-focus-within/reaction:translate-y-0 group-focus-within/reaction:opacity-100">
          <span className="text-gold-300">👍</span> {preview.join(", ")}
          {extra > 0 && (
            <>
              {" "}
              and{" "}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-green-400 underline hover:text-green-300"
              >
                {extra} other{extra === 1 ? "" : "s"}
              </button>
            </>
          )}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Everyone who reacted"
            className="panel max-h-80 w-72 animate-[emoji-pop_260ms_var(--ease-spring)] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="heading text-sm">Reactions ({reactorNames.length})</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-charcoal-400 transition-colors hover:bg-white/5 hover:text-charcoal-100"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="flex flex-col gap-1 text-sm text-charcoal-300">
              {reactorNames.map((name, i) => (
                <li key={i} className="rounded-md px-2 py-1 hover:bg-white/5">
                  👍 {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
