import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/dal";
import { toggleBan, updateRole } from "@/lib/actions/members";
import { staggerStyle } from "@/lib/stagger";
import { Avatar } from "@/components/avatar";
import { ErrorBanner } from "@/components/error-banner";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { RoleBadge } from "@/components/role-badge";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Members" };

const ROLE_RANK: Record<string, number> = { owner: 0, admin: 1, member: 2 };

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireModerator();
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role, is_banned, created_at");

  const sortedMembers = [...(members ?? [])].sort((a, b) => {
    const rankDiff = ROLE_RANK[a.role] - ROLE_RANK[b.role];
    return rankDiff !== 0 ? rankDiff : a.username.localeCompare(b.username);
  });

  const isOwner = profile.role === "owner";

  return (
    <PageContainer width="wide">
      <PageHeader eyebrow="Moderation" title="Members" description={`${sortedMembers.length} adventurers in the guild.`} />

      <ErrorBanner message={error} />

      <div className="panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal-700/70 text-xs tracking-wider text-charcoal-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member, index) => (
              <tr
                key={member.id}
                className="stagger animate-rise-in border-b border-charcoal-700/50 transition-colors last:border-b-0 hover:bg-white/3"
                style={staggerStyle(index)}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar url={member.avatar_url} name={member.display_name} size={32} role={member.role} />
                    <div className="min-w-0">
                      <Link href={`/u/${member.username}`} className="font-semibold text-charcoal-100 hover:text-green-300">
                        {member.display_name}
                      </Link>
                      {member.id === profile.id && <span className="ml-1.5 text-xs text-charcoal-500">(you)</span>}
                      {member.is_banned && (
                        <span className="ml-2 rounded-full border border-danger-600 bg-danger-950 px-2 py-0.5 text-[0.65rem] font-semibold text-danger-400 uppercase">
                          banned
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {isOwner && member.id !== profile.id ? (
                    <form action={updateRole.bind(null, member.id)} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="input w-auto py-1.5 pr-8 text-sm"
                        aria-label={`Rank for ${member.display_name}`}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Officer (admin)</option>
                        <option value="owner">Guild Master (owner)</option>
                      </select>
                      <SubmitButton className="btn btn-secondary btn-sm">Save</SubmitButton>
                    </form>
                  ) : member.role === "member" ? (
                    <span className="text-charcoal-400">Member</span>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                </td>
                <td className="px-5 py-3 text-charcoal-400">{new Date(member.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {member.role !== "owner" && member.id !== profile.id && (
                    <form action={toggleBan.bind(null, member.id, member.is_banned)}>
                      <SubmitButton className={member.is_banned ? "btn btn-ghost btn-sm text-green-400" : "btn btn-danger btn-sm"}>
                        {member.is_banned ? "Unban" : "Ban"}
                      </SubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
