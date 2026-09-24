import { createClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/dal";

export default async function ModerationLogPage() {
  await requireModerator();

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("moderation_log")
    .select("id, action, target_type, detail, created_at, actor:profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal-200">
        Moderation log
      </h1>

      <div className="overflow-x-auto rounded border border-charcoal-700 bg-charcoal-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal-700 text-charcoal-400">
            <tr>
              <th className="p-3 font-medium">Actor</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium">Detail</th>
              <th className="p-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-700">
            {logs?.length ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3 text-charcoal-200">
                    {log.actor?.display_name ?? "System"}
                  </td>
                  <td className="p-3 text-charcoal-300">
                    {log.action.replaceAll("_", " ")}
                  </td>
                  <td className="p-3 text-charcoal-400">{log.detail ?? "-"}</td>
                  <td className="p-3 text-charcoal-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-charcoal-500" colSpan={4}>
                  No moderation activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
