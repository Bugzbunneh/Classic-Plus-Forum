import type { CSSProperties } from "react";

/** Inline style for the `.stagger` class: delays a list item's entrance by its position. */
export function staggerStyle(index: number): CSSProperties {
  return { "--stagger": index } as CSSProperties;
}
