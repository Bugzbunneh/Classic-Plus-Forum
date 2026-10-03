import type { ReactNode } from "react";
import { GameIcon, type GameIconName } from "@/components/game-icon";
import { PageContainer } from "@/components/page-container";

/** A single focused card in the middle of the page - login, signup, reports. */
export function CenteredPanel({
  title,
  description,
  icon = "crossed-swords",
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: GameIconName;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <PageContainer width="narrow" className="justify-center">
      <div className="panel flex animate-rise-in flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-full border border-gold-600/60 bg-linear-to-b from-gold-900 to-charcoal-975 shadow-[0_0_30px_-6px_rgb(224_189_94/0.5),inset_0_1px_0_rgb(255_255_255/0.12)]">
            <GameIcon name={icon} className="size-9 animate-float text-gold-300" />
          </div>
          <h1 className="heading text-2xl">{title}</h1>
          {description && <p className="text-sm text-charcoal-400">{description}</p>}
        </div>
        {children}
      </div>
      {footer && (
        <div className="flex animate-rise-in flex-col items-center gap-2 text-sm text-charcoal-400 [animation-delay:120ms]">
          {footer}
        </div>
      )}
    </PageContainer>
  );
}
