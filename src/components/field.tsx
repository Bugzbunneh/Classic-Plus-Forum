import type { ReactNode } from "react";

/** A labelled form field. Put an `.input` (or a Composer) inside as children. */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
    </div>
  );
}
