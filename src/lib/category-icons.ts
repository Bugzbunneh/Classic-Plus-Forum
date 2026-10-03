import type { GameIconName } from "@/components/game-icon";

const ICON_BY_CATEGORY_SLUG = new Map<string, GameIconName>([
  ["introductions", "shaking-hands"],
  ["general-discussion", "beer-stein"],
  ["class-gameplay", "spell-book"],
  ["events", "knight-banner"],
]);

/** Categories added later without an entry here get a generic scroll. */
export function categoryIcon(slug: string): GameIconName {
  return ICON_BY_CATEGORY_SLUG.get(slug) ?? "tied-scroll";
}
