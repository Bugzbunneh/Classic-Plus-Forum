import type { ReactNode } from "react";
import { GameIcon } from "@/components/game-icon";

/** A flickering campfire and a line or two of text, for lists with nothing in them. */
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <GameIcon name="campfire" className="size-14 animate-flicker text-quality-legendary" />
      <p className="heading text-lg">{title}</p>
      {description && <p className="max-w-sm text-sm text-charcoal-400">{description}</p>}
      {children}
    </div>
  );
}
