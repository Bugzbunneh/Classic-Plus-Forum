import { createClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/dal";
import { toggleBan, updateRole } from "@/lib/actions/members";

const ROLE_RANK: Record<string, number> = { owner: 0, admin: 1, member: 2 };

export default async function MembersPage() {
  const profile = await requireModerator();

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, is_banned, created_at");

  const sortedMembers = [...(members ?? [])].sort((a, b) => {
    const rankDiff = ROLE_RANK[a.role] - ROLE_RANK[b.role];
    return rankDiff !== 0 ? rankDiff : a.username.localeCompare(b.username);
  });

  const isOwner = profile.role === "owner";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal-200">Members</h1>

      <div className="overflow-x-auto rounded border border-charcoal-700 bg-charcoal-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal-700 text-charcoal-400">
            <tr>
              <th className="p-3 font-medium">Member</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-700">
            {sortedMembers.map((member) => (
              <tr key={member.id}>
                <td className="p-3 text-charcoal-200">
                  {member.display_name}
                  {member.id === profile.id && (
                    <span className="ml-1 text-xs text-charcoal-500">
                      (you)
                    </span>
                  )}
                  {member.is_banned && (
                    <span className="ml-2 rounded bg-danger-950 px-1.5 py-0.5 text-xs uppercase text-danger-400">
                      banned
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {isOwner && member.id !== profile.id ? (
                    <form
                      action={updateRole.bind(null, member.id)}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="rounded border border-charcoal-600 bg-charcoal-950 px-2 py-1 text-charcoal-200"
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                        <option value="owner">owner</option>
                      </select>
                      <button
                        type="submit"
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <span
                      className={
                        member.role === "owner"
                          ? "text-gold-400"
                          : member.role === "admin"
                            ? "text-green-400"
                            : "text-charcoal-400"
                      }
                    >
                      {member.role}
                    </span>
                  )}
                </td>
                <td className="p-3 text-charcoal-400">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {member.role !== "owner" && member.id !== profile.id && (
                    <form
                      action={toggleBan.bind(null, member.id, member.is_banned)}
                    >
                      <button
                        type="submit"
                        className={
                          member.is_banned
                            ? "text-green-400 hover:text-green-300"
                            : "text-danger-400 hover:text-danger-500"
                        }
                      >
                        {member.is_banned ? "Unban" : "Ban"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
