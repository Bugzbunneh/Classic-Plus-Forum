import type { createClient } from "@/lib/supabase/server";

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

/**
 * Per-category thread/post counts and most-recent activity, for the
 * homepage's category list. One pass over every post and comment in the
 * forum rather than a query per category.
 */
export async function getCategoryActivitySummaries(
  supabase: SupabaseClient,
): Promise<Map<string, CategoryActivity>> {
  const summaries = new Map<string, CategoryActivity>();

  function summaryFor(categoryId: string): CategoryActivity {
    let summary = summaries.get(categoryId);
    if (!summary) {
      summary = { threadCount: 0, totalPostCount: 0, lastActivity: null };
      summaries.set(categoryId, summary);
    }
    return summary;
  }

  function recordActivity(categoryId: string, activity: NonNullable<CategoryActivity["lastActivity"]>) {
    const summary = summaryFor(categoryId);
    summary.totalPostCount += 1;
    if (!summary.lastActivity || new Date(activity.createdAt) > new Date(summary.lastActivity.createdAt)) {
      summary.lastActivity = activity;
    }
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, category_id, slug, title, created_at, profiles(display_name)")
    .eq("is_deleted", false);

  const postInfoById = new Map<string, { categoryId: string; slug: string; title: string }>();
  posts?.forEach((post) => {
    postInfoById.set(post.id, { categoryId: post.category_id, slug: post.slug, title: post.title });
    summaryFor(post.category_id).threadCount += 1;
    recordActivity(post.category_id, {
      createdAt: post.created_at,
      authorName: post.profiles?.display_name ?? "Unknown",
      postSlug: post.slug,
      postTitle: post.title,
    });
  });

  const { data: comments } = await supabase
    .from("comments")
    .select("post_id, created_at, profiles(display_name)")
    .eq("is_deleted", false);

  comments?.forEach((comment) => {
    const postInfo = comment.post_id ? postInfoById.get(comment.post_id) : undefined;
    if (!postInfo) return;
    recordActivity(postInfo.categoryId, {
      createdAt: comment.created_at,
      authorName: comment.profiles?.display_name ?? "Unknown",
      postSlug: postInfo.slug,
      postTitle: postInfo.title,
    });
  });

  return summaries;
}
