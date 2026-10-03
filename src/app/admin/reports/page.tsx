import Link from "next/link";
import type { Metadata } from "next";
import { Check, ExternalLink, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/dal";
import { resolveReport } from "@/lib/actions/reports";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { staggerStyle } from "@/lib/stagger";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Reports" };

const PREVIEW_LENGTH = 80;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireModerator();
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select(
      "id, reason, created_at, reporter:profiles(display_name), post:posts(title, slug, categories(slug)), comment:comments(body, posts(slug, categories(slug)))",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <PageContainer>
      <PageHeader eyebrow="Moderation" title="Open reports" description="Content members have flagged for review." />

      <ErrorBanner message={error} />

      <ul className="flex flex-col gap-3">
        {reports?.length ? (
          reports.map((report, index) => {
            const postLink = report.post
              ? `/c/${report.post.categories?.slug}/${report.post.slug}`
              : report.comment
                ? `/c/${report.comment.posts?.categories?.slug}/${report.comment.posts?.slug}`
                : null;

            const commentBody = report.comment?.body ?? "";
            const commentPreview =
              commentBody.length > PREVIEW_LENGTH ? `${commentBody.slice(0, PREVIEW_LENGTH)}...` : commentBody;
            const targetLabel = report.post ? report.post.title : `"${commentPreview}"`;

            return (
              <li
                key={report.id}
                className="panel stagger flex animate-rise-in flex-col gap-3 p-5"
                style={staggerStyle(index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-danger-600/60 bg-danger-950 text-danger-400">
                      <Flag className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs tracking-wider text-charcoal-500 uppercase">
                        {report.post ? "Thread" : "Reply"}
                      </p>
                      <p className="truncate font-semibold text-charcoal-100">{targetLabel}</p>
                      <p className="text-xs text-charcoal-500">
                        Reported by {report.reporter?.display_name ?? "Unknown"} ·{" "}
                        {formatRelativeTime(new Date(report.created_at))}
                      </p>
                    </div>
                  </div>
                  <form action={resolveReport.bind(null, report.id)}>
                    <SubmitButton className="btn btn-secondary btn-sm">
                      <Check className="size-3.5" aria-hidden="true" /> Resolve
                    </SubmitButton>
                  </form>
                </div>
                <p className="rounded-lg border border-charcoal-700/70 bg-charcoal-975/60 px-4 py-3 text-sm text-charcoal-300">
                  {report.reason}
                </p>
                {postLink && (
                  <Link href={postLink} className="group flex w-fit items-center gap-1.5 text-sm text-green-400 hover:text-green-300">
                    View content
                    <ExternalLink className="size-3.5 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}
              </li>
            );
          })
        ) : (
          <li className="panel">
            <EmptyState title="No open reports" description="The guild hall is peaceful. Nothing needs your attention." />
          </li>
        )}
      </ul>
    </PageContainer>
  );
}
