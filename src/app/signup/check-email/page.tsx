import type { Metadata } from "next";
import { CenteredPanel } from "@/components/centered-panel";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <CenteredPanel
      title="Check your email"
      description="We've sent you a confirmation link. Click it to activate your account, then log in."
      icon="tied-scroll"
    />
  );
}
