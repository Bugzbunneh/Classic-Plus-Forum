import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { getMilestoneBadge } from "@/lib/achievements";

export function AuthorBox({
  username,
  displayName,
  avatarUrl,
  role,
  postCount,
  compact = false,
  className = "",
}: {
  username: string | null | undefined;
  displayName: string;
  avatarUrl: string | null | undefined;
  role: "member" | "admin" | "owner" | null | undefined;
  postCount: number;
  compact?: boolean;
  className?: string;
}) {
  const milestone = getMilestoneBadge(postCount);
  const avatarSize = compact ? 32 : 56;

  return (
    <div
      className={`flex flex-row items-center gap-3 sm:w-32 sm:shrink-0 sm:flex-col sm:items-center sm:gap-1.5 sm:text-center ${className}`}
    >
      <Avatar url={avatarUrl} name={displayName} size={avatarSize} />
      <div className="flex flex-col gap-0.5 sm:items-center">
        {username ? (
          <Link
            href={`/u/${username}`}
            className="font-medium text-green-400 hover:underline"
          >
            {displayName}
          </Link>
        ) : (
          <span className="font-medium text-charcoal-300">Unknown</span>
        )}

        {role && role !== "member" && (
          <span
            className={`w-fit rounded px-1.5 py-0.5 text-xs font-medium uppercase sm:self-center ${
              role === "owner"
                ? "bg-gold-950 text-gold-400"
                : "bg-green-950 text-green-400"
            }`}
          >
            {role}
          </span>
        )}

        <span className="text-xs text-charcoal-500">
          {postCount} {postCount === 1 ? "post" : "posts"}
        </span>

        {milestone && (
          <span
            className={`w-fit rounded border px-1.5 py-0.5 text-xs font-medium sm:self-center ${milestone.colorClass}`}
          >
            {milestone.label}
          </span>
        )}
      </div>
    </div>
  );
}
