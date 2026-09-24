import type { Metadata } from "next";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Forgot your password?
      </h1>
      <p className="text-sm text-charcoal-400">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <form action={requestPasswordReset} className="flex flex-col gap-4">
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

        <button
          type="submit"
          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          Send reset link
        </button>
      </form>
    </main>
  );
}
