"use client";

import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold text-danger-400">Something broke</h1>
      <p className="text-charcoal-300">
        An unexpected error occurred{error.digest ? ` (ref: ${error.digest})` : ""}. Try again,
        or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => retry()}
          className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded border border-charcoal-600 px-4 py-2 text-sm text-charcoal-300 hover:text-charcoal-100"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
