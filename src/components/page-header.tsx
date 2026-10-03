import type { ReactNode } from "react";
import type { GameIconName } from "@/components/game-icon";
import { IconTile } from "@/components/icon-tile";

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: GameIconName;
  actions?: ReactNode;
}) {
  return (
    <div className="flex animate-rise-in flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="group flex min-w-0 items-center gap-4">
        {icon && <IconTile name={icon} size="lg" />}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
              {eyebrow}
            </p>
          )}
          <h1 className="heading text-2xl sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-charcoal-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
