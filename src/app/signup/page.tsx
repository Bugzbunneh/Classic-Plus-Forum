import Link from "next/link";
import type { Metadata } from "next";
import { signup, signInWithDiscord } from "@/lib/actions/auth";
import { CenteredPanel } from "@/components/centered-panel";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { OrDivider } from "@/components/or-divider";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <CenteredPanel
      title="Join the guild"
      description="Create an account to post, reply, and earn achievements."
      icon="knight-banner"
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-400 hover:text-green-300 hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <ErrorBanner message={error} />

      <form action={signInWithDiscord}>
        <SubmitButton className="btn btn-discord w-full">Continue with Discord</SubmitButton>
      </form>

      <OrDivider />

      <form action={signup} className="flex flex-col gap-4">
        <Field label="Username" htmlFor="username">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            minLength={3}
            className="input"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </Field>

        <Field label="Password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="input"
          />
        </Field>

        <SubmitButton className="btn btn-primary mt-1 w-full">Create account</SubmitButton>
      </form>
    </CenteredPanel>
  );
}
