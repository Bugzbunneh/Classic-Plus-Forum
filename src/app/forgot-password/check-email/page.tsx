import Link from "next/link";
import type { Metadata } from "next";
import { CenteredPanel } from "@/components/centered-panel";

export const metadata: Metadata = { title: "Check your email" };

export default function ForgotPasswordCheckEmailPage() {
  return (
    <CenteredPanel
      title="Check your email"
      description="If an account exists for that email, we've sent a link to reset your password."
      icon="tied-scroll"
      footer={
        <Link href="/login" className="font-semibold text-green-400 hover:text-green-300 hover:underline">
          Back to log in
        </Link>
      }
    />
  );
}
