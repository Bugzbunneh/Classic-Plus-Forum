import { ViewTransition, type ReactNode } from "react";

const WIDTH_CLASSES = {
  narrow: "max-w-md",
  default: "max-w-3xl",
  wide: "max-w-5xl",
} as const;

/**
 * Every page's outer <main>. Also the page's view transition: when you
 * navigate, the old page fades out and the new one fades and rises in (see
 * the `.page` rules in globals.css). It has to live in each page rather than
 * the layout, because layouts persist across navigations and never re-enter.
 */
export function PageContainer({
  width = "default",
  className = "",
  children,
}: {
  width?: keyof typeof WIDTH_CLASSES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <main
        className={`mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 ${WIDTH_CLASSES[width]} ${className}`}
      >
        {children}
      </main>
    </ViewTransition>
  );
}
