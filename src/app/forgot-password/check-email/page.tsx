import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email" };

export default function ForgotPasswordCheckEmailPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Check your email
      </h1>
      <p className="text-charcoal-400">
        If an account exists for that email, we&apos;ve sent a link to reset
        your password.
      </p>
    </main>
  );
}
