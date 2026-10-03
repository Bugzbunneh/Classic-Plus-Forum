"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { GameIcon } from "@/components/game-icon";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <GameIcon name="campfire" className="size-16 animate-flicker text-quality-legendary" />
      <h1 className="heading text-3xl text-danger-400">Something broke</h1>
      <p className="text-charcoal-300">
        An unexpected error occurred{error.digest ? ` (ref: ${error.digest})` : ""}. Try again,
        or head back home.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={() => retry()} className="group btn btn-primary">
          <RotateCcw className="size-4 transition-transform duration-500 ease-spring group-hover:-rotate-180" />
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Home
        </Link>
      </div>
    </main>
  );
}
