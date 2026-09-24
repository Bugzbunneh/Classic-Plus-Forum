import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/dal";
import { resolveReport } from "@/lib/actions/reports";

export default async function ReportsPage() {
  await requireModerator();

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select(
      "id, reason, created_at, reporter:profiles(display_name), post:posts(title, slug, categories(slug)), comment:comments(body, posts(slug, categories(slug)))",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Open reports
      </h1>

      <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
        {reports?.length ? (
          reports.map((report) => {
            const postLink = report.post
              ? `/c/${report.post.categories?.slug}/${report.post.slug}`
              : report.comment
                ? `/c/${report.comment.posts?.categories?.slug}/${report.comment.posts?.slug}`
                : null;
            const targetLabel = report.post
              ? `Post: ${report.post.title}`
              : `Comment: "${report.comment?.body.slice(0, 60)}${(report.comment?.body.length ?? 0) > 60 ? "..." : ""}"`;

            return (
              <li key={report.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-charcoal-200">{targetLabel}</p>
                    <p className="text-sm text-charcoal-400">
                      Reported by {report.reporter?.display_name ?? "Unknown"}{" "}
                      &middot; {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  <form action={resolveReport.bind(null, report.id)}>
                    <button
                      type="submit"
                      className="rounded border border-charcoal-600 px-2 py-1 text-xs text-charcoal-300 hover:text-charcoal-100"
                    >
                      Resolve
                    </button>
                  </form>
                </div>
                <p className="text-sm text-charcoal-400">
                  Reason: {report.reason}
                </p>
                {postLink && (
                  <Link
                    href={postLink}
                    className="w-fit text-sm text-green-400 hover:underline"
                  >
                    View content &rarr;
                  </Link>
                )}
              </li>
            );
          })
        ) : (
          <li className="p-4 text-sm text-charcoal-500">No open reports.</li>
        )}
      </ul>
    </main>
  );
}
