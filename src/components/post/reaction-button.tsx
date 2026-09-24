"use client";

import { useState } from "react";

const PREVIEW_COUNT = 3;

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
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const preview = reactorNames.slice(0, PREVIEW_COUNT);
  const extra = reactorNames.length - preview.length;

  return (
    <div className="relative inline-block">
      <form action={action}>
        <button
          type="submit"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`w-fit rounded border px-2 py-1 text-xs ${
            hasReacted
              ? "border-green-600 text-green-400"
              : "border-charcoal-600 text-charcoal-400 hover:text-charcoal-200"
          }`}
        >
          👍 {count}
        </button>
      </form>

      {hovered && count > 0 && (
        <div className="absolute bottom-full left-0 z-10 mb-1 whitespace-nowrap rounded border border-charcoal-600 bg-charcoal-950 px-2 py-1 text-xs text-charcoal-200 shadow-lg">
          {preview.join(", ")}
          {extra > 0 && (
            <>
              {" "}
              and{" "}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-green-400 underline hover:text-green-300"
              >
                ({extra} other{extra === 1 ? "" : "s"})
              </button>
            </>
          )}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-80 w-64 overflow-y-auto rounded border border-charcoal-600 bg-charcoal-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-sm font-semibold text-charcoal-200">
              Reactions ({reactorNames.length})
            </h3>
            <ul className="flex flex-col gap-1 text-sm text-charcoal-300">
              {reactorNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-3 text-xs text-charcoal-400 hover:text-charcoal-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
