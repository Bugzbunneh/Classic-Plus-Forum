import Link from "next/link";
import { signup, signInWithDiscord } from "@/lib/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Create an account
      </h1>

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

      <form action={signup} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm text-charcoal-300">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>

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
            minLength={8}
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          Sign up
        </button>
      </form>

      <p className="text-sm text-charcoal-400">
        Already have an account?{" "}
        <Link href="/login" className="text-green-400 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
