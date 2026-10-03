import Link from "next/link";
import type { Metadata } from "next";
import { CheckCheck, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { staggerStyle } from "@/lib/stagger";
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireProfile("/notifications");

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      "id, is_read, created_at, actor:profiles!notifications_actor_id_fkey(display_name), post:posts(title, slug, categories(slug))",
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const hasUnread = notifications?.some((n) => !n.is_read) ?? false;

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Replies to your threads."
        actions={
          hasUnread && (
            <form action={markAllNotificationsRead}>
              <SubmitButton className="btn btn-secondary btn-sm">
                <CheckCheck className="size-4" aria-hidden="true" />
                Mark all as read
              </SubmitButton>
            </form>
          )
        }
      />

      <ul className="panel flex flex-col overflow-hidden">
        {notifications?.length ? (
          notifications.map((notification, index) => {
            const actorName = notification.actor?.display_name ?? "Someone";
            const postHref = notification.post
              ? `/c/${notification.post.categories?.slug}/${notification.post.slug}`
              : null;

            return (
              <li
                key={notification.id}
                className={`group stagger relative flex animate-rise-in items-start gap-3 border-b border-charcoal-700/60 px-5 py-4 transition-colors last:border-b-0 hover:bg-white/3 ${
                  notification.is_read ? "" : "bg-green-950/30"
                }`}
                style={staggerStyle(index)}
              >
                <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-charcoal-700 bg-charcoal-900 text-gold-400 transition-transform duration-300 ease-spring group-hover:scale-110">
                  <MessageSquare className="size-4" aria-hidden="true" />
                  {!notification.is_read && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-badge-pulse rounded-full bg-green-500" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-charcoal-300">
                    <strong className="text-charcoal-100">{actorName}</strong> replied to{" "}
                    {postHref ? (
                      <Link
                        href={postHref}
                        className="font-semibold text-green-400 after:absolute after:inset-0 group-hover:text-green-300"
                      >
                        {notification.post?.title}
                      </Link>
                    ) : (
                      "your post"
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal-500">
                    {formatRelativeTime(new Date(notification.created_at))}
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <li>
            <EmptyState title="All quiet" description="When someone replies to your threads, you'll see it here." />
          </li>
        )}
      </ul>
    </PageContainer>
  );
}
