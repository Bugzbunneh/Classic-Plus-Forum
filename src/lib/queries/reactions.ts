import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type ReactionInfo = { count: number; hasReacted: boolean; reactorNames: string[] };

type ReactionRow = { user_id: string; profiles: { display_name: string } | null };

function summarizeReactions(rows: ReactionRow[], currentUserId: string | undefined): ReactionInfo {
  return {
    count: rows.length,
    hasReacted: currentUserId ? rows.some((row) => row.user_id === currentUserId) : false,
    reactorNames: rows.map((row) => row.profiles?.display_name ?? "Unknown"),
  };
}

export async function getPostReactions(
  supabase: SupabaseClient,
  postId: string,
  currentUserId: string | undefined,
): Promise<ReactionInfo> {
  const { data } = await supabase
    .from("reactions")
    .select("user_id, profiles(display_name)")
    .eq("post_id", postId);

  return summarizeReactions(data ?? [], currentUserId);
}

/** Always has an entry for every id in `commentIds`, even with zero reactions. */
export async function getCommentReactions(
  supabase: SupabaseClient,
  commentIds: string[],
  currentUserId: string | undefined,
): Promise<Map<string, ReactionInfo>> {
  const rowsByComment = new Map<string, ReactionRow[]>();

  if (commentIds.length > 0) {
    const { data } = await supabase
      .from("reactions")
      .select("comment_id, user_id, profiles(display_name)")
      .in("comment_id", commentIds);

    data?.forEach((row) => {
      if (!row.comment_id) return;
      const rows = rowsByComment.get(row.comment_id) ?? [];
      rows.push(row);
      rowsByComment.set(row.comment_id, rows);
    });
  }

  return new Map(
    commentIds.map((id) => [id, summarizeReactions(rowsByComment.get(id) ?? [], currentUserId)]),
  );
}
