import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Total posts + comments per author, for the "N posts" accolade in the
 * author box. Batched into two queries covering every author passed in,
 * rather than one query per author.
 */
export async function getAuthorActivityCounts(supabase: SupabaseClient, authorIds: string[]) {
  const counts = new Map<string, number>();
  const increment = (authorId: string) => counts.set(authorId, (counts.get(authorId) ?? 0) + 1);

  const { data: postRows } = await supabase
    .from("posts")
    .select("author_id")
    .eq("is_deleted", false)
    .in("author_id", authorIds);
  postRows?.forEach(({ author_id }) => increment(author_id));

  const { data: commentRows } = await supabase
    .from("comments")
    .select("author_id")
    .eq("is_deleted", false)
    .in("author_id", authorIds);
  commentRows?.forEach(({ author_id }) => increment(author_id));

  return counts;
}
