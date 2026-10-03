import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Total posts + comments per author, for the "N posts" accolade in the
 * author box. Counted in Postgres by the `author_activity` view.
 */
export async function getAuthorActivityCounts(supabase: SupabaseClient, authorIds: string[]) {
  const { data: rows } = await supabase
    .from("author_activity")
    .select("author_id, activity_count")
    .in("author_id", authorIds);

  const countEntries = (rows ?? []).map((row) => [row.author_id!, row.activity_count ?? 0] as const);
  return new Map(countEntries);
}
