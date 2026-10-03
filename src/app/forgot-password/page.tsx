import Link from "next/link";
import type { Metadata } from "next";
import { requestPasswordReset } from "@/lib/actions/auth";
import { CenteredPanel } from "@/components/centered-panel";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <CenteredPanel
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
      icon="tied-scroll"
      footer={
        <Link href="/login" className="font-semibold text-green-400 hover:text-green-300 hover:underline">
          Back to log in
        </Link>
      }
    >
      <form action={requestPasswordReset} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </Field>

        <SubmitButton className="btn btn-primary w-full">Send reset link</SubmitButton>
      </form>
    </CenteredPanel>
  );
}
