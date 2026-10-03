import Link from "next/link";
import type { Metadata } from "next";
import { CenteredPanel } from "@/components/centered-panel";

export const metadata: Metadata = { title: "Report submitted" };

export default function ReportThanksPage() {
  return (
    <CenteredPanel
      title="Thanks for the report"
      description="An officer will take a look shortly."
      icon="griffin-shield"
      footer={
        <Link href="/" className="font-semibold text-green-400 hover:text-green-300 hover:underline">
          Back to the forum
        </Link>
      }
    />
  );
}
