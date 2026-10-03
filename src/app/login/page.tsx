import Link from "next/link";
import type { Metadata } from "next";
import { login, signInWithDiscord } from "@/lib/actions/auth";
import { CenteredPanel } from "@/components/centered-panel";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { OrDivider } from "@/components/or-divider";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <CenteredPanel
      title="Welcome back"
      description="Log in to rejoin the guild."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-green-400 hover:text-green-300 hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <ErrorBanner message={error} />

      <form action={signInWithDiscord}>
        <SubmitButton className="btn btn-discord w-full">Continue with Discord</SubmitButton>
      </form>

      <OrDivider />

      <form action={login} className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </Field>

        <Field
          label={
            <span className="flex items-center justify-between">
              Password
              <Link href="/forgot-password" className="text-xs font-normal text-green-400 hover:text-green-300 hover:underline">
                Forgot it?
              </Link>
            </span>
          }
          htmlFor="password"
        >
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
          />
        </Field>

        <SubmitButton className="btn btn-primary mt-1 w-full">Log in</SubmitButton>
      </form>
    </CenteredPanel>
  );
}
