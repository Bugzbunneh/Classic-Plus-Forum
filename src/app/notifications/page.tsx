import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal-200">
          Notifications
        </h1>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="text-sm text-green-400 hover:underline"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
        {notifications?.length ? (
          notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 ${notification.is_read ? "" : "bg-charcoal-800"}`}
            >
              {notification.post ? (
                <Link
                  href={`/c/${notification.post.categories?.slug}/${notification.post.slug}`}
                  className="block text-green-400 hover:underline"
                >
                  {notification.actor?.display_name ?? "Someone"} replied to
                  &quot;{notification.post.title}&quot;
                </Link>
              ) : (
                <span className="text-charcoal-300">
                  {notification.actor?.display_name ?? "Someone"} replied to
                  your post
                </span>
              )}
              <p className="text-sm text-charcoal-400">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-charcoal-500">
            No notifications yet.
          </li>
        )}
      </ul>
    </main>
  );
}
