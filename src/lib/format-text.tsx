import type { ReactNode } from "react";

// Deliberately minimal: **bold** and *italic* only, no HTML parsing at all -
// content is inserted as React text nodes, never dangerouslySetInnerHTML, so
// there's no injection risk regardless of what a user types.
export function formatText(text: string): ReactNode[] {
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
