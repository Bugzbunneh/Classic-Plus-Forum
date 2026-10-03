"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

/**
 * A form's submit button that shows a spinner and disables itself while the
 * Server Action runs, so a click always gets immediate feedback.
 */
export function SubmitButton({
  children,
  className = "btn btn-primary",
  ...buttonProps
}: Omit<ComponentProps<"button">, "type">) {
  const { pending } = useFormStatus();

  return (
    <button
      {...buttonProps}
      type="submit"
      disabled={pending || buttonProps.disabled}
      aria-busy={pending}
      className={className}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
