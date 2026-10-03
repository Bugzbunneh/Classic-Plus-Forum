"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Flag, LogOut, ScrollText, Settings, User, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { RoleBadge } from "@/components/role-badge";
import { logout } from "@/lib/actions/auth";
import type { Role } from "@/lib/roles";

/**
 * The avatar button in the header and the dropdown it opens. Uses the native
 * Popover API, which handles click-outside and Escape to close for free.
 */
export function UserMenu({
  username,
  displayName,
  avatarUrl,
  role,
  canModerate,
  openReportCount,
}: {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  canModerate: boolean;
  openReportCount: number;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Following a link inside the menu doesn't count as clicking outside it,
  // so close it explicitly when any link or button inside is used.
  function closeOnItemClick(event: MouseEvent<HTMLDivElement>) {
    const clickedItem = (event.target as HTMLElement).closest("a, button");
    if (clickedItem) {
      menuRef.current?.hidePopover();
    }
  }

  return (
    <>
      <button
        type="button"
        popoverTarget="user-menu"
        className="group flex items-center gap-2 rounded-full border border-charcoal-700 bg-charcoal-900/70 py-1 pr-2 pl-1 transition-[border-color,box-shadow,transform] duration-200 ease-spring hover:border-gold-700 hover:shadow-[0_0_18px_-6px_rgb(224_189_94/0.5)] active:scale-95 sm:pr-3"
        aria-label="Open account menu"
      >
        <span className="relative">
          <Avatar url={avatarUrl} name={displayName} size={30} role={role} />
          {canModerate && openReportCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-badge-pulse rounded-full border border-charcoal-900 bg-danger-400" />
          )}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-charcoal-200 sm:block">
          {displayName}
        </span>
        <ChevronDown className="size-4 text-charcoal-400 transition-transform duration-300 ease-spring group-hover:translate-y-0.5" />
      </button>

      <div
        ref={menuRef}
        id="user-menu"
        popover="auto"
        onClick={closeOnItemClick}
        className="popover-menu panel fixed bg-charcoal-900 inset-auto top-[4.5rem] right-[max(1rem,calc((100vw-72rem)/2+1.5rem))] m-0 w-64 p-2 text-charcoal-200"
      >
        <div className="flex items-center gap-3 border-b border-charcoal-700/70 px-2 pt-1 pb-3">
          <Avatar url={avatarUrl} name={displayName} size={40} role={role} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-charcoal-100">{displayName}</p>
            <RoleBadge role={role} className="mt-0.5" />
          </div>
        </div>

        <div className="flex flex-col py-1.5">
          <MenuLink href={`/u/${username}`} icon={<User />}>
            Your profile
          </MenuLink>
          <MenuLink href="/settings" icon={<Settings />}>
            Settings
          </MenuLink>
        </div>

        {canModerate && (
          <div className="flex flex-col border-t border-charcoal-700/70 py-1.5">
            <p className="px-3 pt-1 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-500">
              Moderation
            </p>
            <MenuLink href="/admin/members" icon={<Users />}>
              Members
            </MenuLink>
            <MenuLink href="/admin/reports" icon={<Flag />}>
              Reports
              {openReportCount > 0 && (
                <span className="ml-auto rounded-full bg-danger-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {openReportCount}
                </span>
              )}
            </MenuLink>
            <MenuLink href="/admin/log" icon={<ScrollText />}>
              Moderation log
            </MenuLink>
          </div>
        )}

        <form action={logout} className="border-t border-charcoal-700/70 pt-1.5">
          <button type="submit" className={`${MENU_ITEM_CLASS} w-full text-danger-400 hover:bg-danger-950/70`}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </>
  );
}

const MENU_ITEM_CLASS =
  "group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-[background-color,color,padding] duration-200 hover:pl-4 [&_svg]:size-4 [&_svg]:shrink-0";

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className={`${MENU_ITEM_CLASS} text-charcoal-300 hover:bg-white/5 hover:text-charcoal-100`}>
      <span className="text-charcoal-500 transition-colors group-hover/item:text-gold-400" aria-hidden="true">
        {icon}
      </span>
      {children}
    </Link>
  );
}
