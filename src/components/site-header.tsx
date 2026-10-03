import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { isModerator } from "@/lib/roles";
import { GameIcon } from "@/components/game-icon";
import { UserMenu } from "@/components/user-menu";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const canModerate = isModerator(profile?.role);

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

    if (canModerate) {
      const { count: reportCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      openReportCount = reportCount ?? 0;
    }
  }

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-white/5 bg-charcoal-975/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <SiteLogo />

        <nav className="flex items-center gap-2">
          {profile ? (
            <>
              <NotificationBell unreadCount={unreadCount} />
              <UserMenu
                username={profile.username}
                displayName={profile.display_name}
                avatarUrl={profile.avatar_url}
                role={profile.role}
                canModerate={canModerate}
                openReportCount={openReportCount}
              />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Gold hairline along the bottom edge, brightest in the middle. */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-gold-600/50 to-transparent" />
    </header>
  );
}

function SiteLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Classic Plus Forum home">
      <GameIcon
        name="crossed-swords"
        className="size-8 text-gold-400 drop-shadow-[0_0_8px_rgb(224_189_94/0.45)] transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:-rotate-12"
      />
      <span className="flex flex-col leading-none">
        <span className="heading text-gold-gradient text-lg">Classic Plus</span>
        <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-charcoal-400 transition-colors group-hover:text-green-400">
          Forum
        </span>
      </span>
    </Link>
  );
}

function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const label = unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications";

  return (
    <Link
      href="/notifications"
      aria-label={label}
      className="group relative flex size-10 items-center justify-center rounded-full text-charcoal-400 transition-[background-color,color,transform] duration-200 ease-spring hover:bg-white/5 hover:text-gold-300 active:scale-90"
    >
      <Bell className="size-5 origin-top group-hover:animate-ring" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex min-w-4.5 animate-badge-pulse items-center justify-center rounded-full bg-green-500 px-1 text-[0.65rem] leading-4.5 font-bold text-charcoal-975">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
