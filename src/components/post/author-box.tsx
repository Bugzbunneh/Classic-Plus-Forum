import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { RoleBadge } from "@/components/role-badge";
import { AchievementBadge } from "@/components/achievement-badge";
import { getMilestoneBadge } from "@/lib/achievements";
import type { Role } from "@/lib/roles";

export function AuthorBox({
  username,
  displayName,
  avatarUrl,
  role,
  postCount,
  compact = false,
}: {
  username: string | null | undefined;
  displayName: string;
  avatarUrl: string | null | undefined;
  role: Role | null | undefined;
  postCount: number;
  compact?: boolean;
}) {
  const milestone = getMilestoneBadge(postCount);
  const avatarSize = compact ? 40 : 64;

  return (
    <div className="flex flex-row items-center gap-3 border-charcoal-700/70 pb-3 max-sm:border-b sm:w-36 sm:shrink-0 sm:flex-col sm:gap-2 sm:border-r sm:pr-4 sm:pb-0 sm:text-center">
      <div className="transition-transform duration-300 ease-spring hover:scale-105 hover:-rotate-3">
        <Avatar url={avatarUrl} name={displayName} size={avatarSize} role={role} />
      </div>
      <div className="flex min-w-0 flex-col gap-1 sm:items-center">
        {username ? (
          <Link
            href={`/u/${username}`}
            className="truncate font-semibold text-green-400 transition-colors hover:text-green-300"
          >
            {displayName}
          </Link>
        ) : (
          <span className="font-semibold text-charcoal-300">Unknown</span>
        )}

        <RoleBadge role={role} />

        <span className="text-xs text-charcoal-500">
          {postCount} {postCount === 1 ? "post" : "posts"}
        </span>

        {milestone && <AchievementBadge milestone={milestone} />}
      </div>
    </div>
  );
}
