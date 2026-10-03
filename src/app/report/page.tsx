import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal";
import { createReport } from "@/lib/actions/reports";
import { CenteredPanel } from "@/components/centered-panel";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Report content" };

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string; commentId?: string; error?: string }>;
}) {
  const { postId, commentId, error } = await searchParams;
  const targetQuery = postId ? `postId=${postId}` : `commentId=${commentId}`;
  await requireProfile(`/report?${targetQuery}`);

  if (!postId && !commentId) {
    redirect("/");
  }

  return (
    <CenteredPanel
      title="Report content"
      description="Officers will review it. Reports are only visible to them."
      icon="griffin-shield"
    >
      <ErrorBanner message={error} />

      <form action={createReport} className="flex flex-col gap-4">
        {postId && <input type="hidden" name="postId" value={postId} />}
        {commentId && <input type="hidden" name="commentId" value={commentId} />}
        <Field label="What's wrong with this?" htmlFor="reason">
          <textarea id="reason" name="reason" required rows={4} className="input resize-y" />
        </Field>
        <SubmitButton className="btn btn-primary w-full">Submit report</SubmitButton>
      </form>
    </CenteredPanel>
  );
}
