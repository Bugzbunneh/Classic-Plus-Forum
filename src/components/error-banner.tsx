import { CircleAlert } from "lucide-react";

/** Shakes in so a failed action is impossible to miss. */
export function ErrorBanner({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="flex animate-shake items-start gap-2.5 rounded-lg border border-danger-600 bg-danger-950/80 px-4 py-3 text-sm text-danger-400 shadow-[0_0_24px_-8px_rgb(200_88_80/0.6)]"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
