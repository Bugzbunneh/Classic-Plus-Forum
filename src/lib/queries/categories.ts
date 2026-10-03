import type { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getCategoryBySlug(supabase: SupabaseClient, slug: string) {
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("slug", slug)
    .single();

  return category;
}

export type CategoryActivity = {
  threadCount: number;
  totalPostCount: number;
  lastActivity: {
    createdAt: string;
    authorName: string;
    postSlug: string;
    postTitle: string;
  } | null;
};

type CategoryActivityRow = Database["public"]["Views"]["category_activity"]["Row"];

function fromRow(row: CategoryActivityRow): CategoryActivity {
  const { last_activity_at, last_post_slug, last_post_title, last_author_name } = row;

  const lastActivity =
    last_activity_at && last_post_slug && last_post_title
      ? {
          createdAt: last_activity_at,
          authorName: last_author_name ?? "Unknown",
          postSlug: last_post_slug,
          postTitle: last_post_title,
        }
      : null;

  return {
    threadCount: row.thread_count ?? 0,
    totalPostCount: row.total_post_count ?? 0,
    lastActivity,
  };
}

/**
 * Per-category thread/post counts and most-recent activity, for the
 * homepage's category list. Aggregated in Postgres by the
 * `category_activity` view; categories with no posts have no row.
 */
export async function getCategoryActivitySummaries(
  supabase: SupabaseClient,
): Promise<Map<string, CategoryActivity>> {
  const { data: rows } = await supabase.from("category_activity").select("*");

  const summaryEntries = (rows ?? []).map((row) => [row.category_id!, fromRow(row)] as const);
  return new Map(summaryEntries);
}
