import Link from "next/link";
import { getCurrentProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const isModerator = profile?.role === "admin" || profile?.role === "owner";

  let unreadCount = 0;
  let openReportCount = 0;

  if (profile) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;

    if (isModerator) {
      const { count: reportCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      openReportCount = reportCount ?? 0;
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-charcoal-700 bg-charcoal-900 px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-green-400">
        Classic Plus Forum
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {profile ? (
          <>
            {isModerator && (
              <>
                <Link
                  href="/admin/members"
                  className="text-charcoal-400 hover:text-charcoal-200"
                >
                  Members
                </Link>
                <Link
                  href="/admin/reports"
                  className="text-charcoal-400 hover:text-charcoal-200"
                >
                  Reports
                  {openReportCount > 0 && (
                    <span className="ml-1 rounded bg-danger-600 px-1.5 py-0.5 text-xs text-white">
                      {openReportCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/log"
                  className="text-charcoal-400 hover:text-charcoal-200"
                >
                  Log
                </Link>
              </>
            )}
            <Link
              href="/notifications"
              className="text-charcoal-400 hover:text-charcoal-200"
            >
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 rounded bg-green-700 px-1.5 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/settings"
              className="text-charcoal-400 hover:text-charcoal-200"
            >
              Settings
            </Link>
            <Link
              href={`/u/${profile.username}`}
              className="flex items-center text-charcoal-300 hover:text-charcoal-100"
            >
              {profile.display_name}
              {profile.role !== "member" && (
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
                    profile.role === "owner"
                      ? "bg-gold-950 text-gold-400"
                      : "bg-green-950 text-green-400"
                  }`}
                >
                  {profile.role}
                </span>
              )}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-charcoal-400 hover:text-charcoal-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-green-700 px-3 py-1.5 font-medium text-white hover:bg-green-600"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
