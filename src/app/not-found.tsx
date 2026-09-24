import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold text-gold-400">404</h1>
      <p className="text-charcoal-300">
        This page doesn&apos;t exist — maybe it wandered off into Silithus.
      </p>
      <Link
        href="/"
        className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
      >
        Back to the forum
      </Link>
    </main>
  );
}
