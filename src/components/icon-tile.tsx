import { GameIcon, type GameIconName } from "@/components/game-icon";

const SIZE_CLASSES = {
  md: { tile: "size-12 rounded-lg", icon: "size-7" },
  lg: { tile: "size-16 rounded-xl", icon: "size-10" },
} as const;

/**
 * A game icon set in a bevelled, gold-trimmed tile - like an ability icon on
 * a WoW action bar. Wiggles when an ancestor with the `group` class is
 * hovered, so a whole card can bring it to life.
 */
export function IconTile({ name, size = "md" }: { name: GameIconName; size?: keyof typeof SIZE_CLASSES }) {
  const classes = SIZE_CLASSES[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center border border-gold-700/60 bg-linear-to-br from-green-800 via-green-950 to-charcoal-975 text-gold-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.15),inset_0_-8px_16px_rgb(0_0_0/0.5),0_6px_16px_-6px_rgb(0_0_0/0.8)] transition-[box-shadow,border-color] duration-300 group-hover:border-gold-400 group-hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),inset_0_-8px_16px_rgb(0_0_0/0.4),0_0_24px_-4px_rgb(224_189_94/0.55)] ${classes.tile}`}
    >
      <GameIcon
        name={name}
        className={`${classes.icon} drop-shadow-[0_2px_2px_rgb(0_0_0/0.8)] transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-115`}
      />
    </div>
  );
}
