import Link from "next/link";
import type { Metadata } from "next";
import { login, signInWithDiscord } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-charcoal-200">Log in</h1>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}

      <form action={signInWithDiscord}>
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
        >
          Continue with Discord
        </button>
      </form>

      <div className="flex items-center gap-3 text-sm text-charcoal-500">
        <div className="h-px flex-1 bg-charcoal-700" />
        or
        <div className="h-px flex-1 bg-charcoal-700" />
      </div>

      <form action={login} className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-charcoal-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-charcoal-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          Log in
        </button>
      </form>

      <p className="text-sm text-charcoal-400">
        <Link href="/forgot-password" className="text-green-400 hover:underline">
          Forgot your password?
        </Link>
      </p>

      <p className="text-sm text-charcoal-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-green-400 hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
