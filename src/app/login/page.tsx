import Link from "next/link";
import { login, signInWithDiscord } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>

      {error && (
        <p className="rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
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

      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <div className="h-px flex-1 bg-zinc-700" />
        or
        <div className="h-px flex-1 bg-zinc-700" />
      </div>

      <form action={login} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded border border-zinc-700 bg-transparent px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded border border-zinc-700 bg-transparent px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600"
        >
          Log in
        </button>
      </form>

      <p className="text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-emerald-400 hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
