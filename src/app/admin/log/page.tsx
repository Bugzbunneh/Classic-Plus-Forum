import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireModerator } from "@/lib/dal";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { staggerStyle } from "@/lib/stagger";
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Moderation log" };

export default async function ModerationLogPage() {
  await requireModerator();

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("moderation_log")
    .select("id, action, target_type, detail, created_at, actor:profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <PageContainer width="wide">
      <PageHeader eyebrow="Moderation" title="Moderation log" description="Every officer action, newest first." />

      <div className="panel overflow-x-auto">
        {logs?.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-charcoal-700/70 text-xs tracking-wider text-charcoal-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Officer</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Detail</th>
                <th className="px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr
                  key={log.id}
                  className="stagger animate-rise-in border-b border-charcoal-700/50 transition-colors last:border-b-0 hover:bg-white/3"
                  style={staggerStyle(index)}
                >
                  <td className="px-5 py-3 font-semibold text-charcoal-100">{log.actor?.display_name ?? "System"}</td>
                  <td className="px-5 py-3">
                    <span className="chip capitalize">{log.action.replaceAll("_", " ")}</span>
                  </td>
                  <td className="px-5 py-3 text-charcoal-400">{log.detail ?? "-"}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-charcoal-500">
                    {formatRelativeTime(new Date(log.created_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="Nothing logged yet" description="Officer actions like pins, locks, and bans will show up here." />
        )}
      </div>
    </PageContainer>
  );
}
