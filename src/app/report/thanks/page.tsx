import type { Metadata } from "next";

export const metadata: Metadata = { title: "Report submitted" };

export default function ReportThanksPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Thanks for the report
      </h1>
      <p className="text-charcoal-400">
        A moderator will take a look shortly.
      </p>
    </main>
  );
}
