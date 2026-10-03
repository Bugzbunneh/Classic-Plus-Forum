import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal";
import { updatePassword } from "@/lib/actions/auth";
import { CenteredPanel } from "@/components/centered-panel";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireProfile("/reset-password");
  const { error } = await searchParams;

  return (
    <CenteredPanel title="Set a new password" icon="griffin-shield">
      <ErrorBanner message={error} />

      <form action={updatePassword} className="flex flex-col gap-4">
        <Field label="New password" htmlFor="password">
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

        <Field label="Confirm new password" htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="input"
          />
        </Field>

        <SubmitButton className="btn btn-primary mt-1 w-full">Update password</SubmitButton>
      </form>
    </CenteredPanel>
  );
}
