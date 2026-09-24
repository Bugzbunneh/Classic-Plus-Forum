import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal";
import { createReport } from "@/lib/actions/reports";

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Report content
      </h1>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}

      <form action={createReport} className="flex flex-col gap-4">
        {postId && <input type="hidden" name="postId" value={postId} />}
        {commentId && <input type="hidden" name="commentId" value={commentId} />}
        <div className="flex flex-col gap-1">
          <label htmlFor="reason" className="text-sm text-charcoal-300">
            What&apos;s wrong with this?
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            rows={4}
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          Submit report
        </button>
      </form>
    </main>
  );
}
