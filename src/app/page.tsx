import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format-relative-time";

type Activity = {
  createdAt: string;
  authorName: string;
  postSlug: string;
  postTitle: string;
};

export default async function Home() {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("sections")
    .select("id, name, categories(id, name, slug, description)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "categories" });

  const { data: posts } = await supabase
    .from("posts")
    .select("id, category_id, slug, title, created_at, profiles(display_name)")
    .eq("is_deleted", false);

  const { data: comments } = await supabase
    .from("comments")
    .select("post_id, created_at, profiles(display_name)")
    .eq("is_deleted", false);

  const categoryIdByPostId = new Map<string, string>();
  const postInfoById = new Map<string, { slug: string; title: string }>();
  const threadCountByCategory = new Map<string, number>();
  const latestActivityByCategory = new Map<string, Activity>();

  function considerActivity(categoryId: string, activity: Activity) {
    const existing = latestActivityByCategory.get(categoryId);
    if (!existing || new Date(activity.createdAt) > new Date(existing.createdAt)) {
      latestActivityByCategory.set(categoryId, activity);
    }
  }

  posts?.forEach((post) => {
    categoryIdByPostId.set(post.id, post.category_id);
    postInfoById.set(post.id, { slug: post.slug, title: post.title });
    threadCountByCategory.set(
      post.category_id,
      (threadCountByCategory.get(post.category_id) ?? 0) + 1,
    );
    considerActivity(post.category_id, {
      createdAt: post.created_at,
      authorName: post.profiles?.display_name ?? "Unknown",
      postSlug: post.slug,
      postTitle: post.title,
    });
  });

  const commentCountByCategory = new Map<string, number>();
  comments?.forEach((comment) => {
    const categoryId = comment.post_id ? categoryIdByPostId.get(comment.post_id) : undefined;
    const post = comment.post_id ? postInfoById.get(comment.post_id) : undefined;
    if (!categoryId || !post) return;

    commentCountByCategory.set(categoryId, (commentCountByCategory.get(categoryId) ?? 0) + 1);
    considerActivity(categoryId, {
      createdAt: comment.created_at,
      authorName: comment.profiles?.display_name ?? "Unknown",
      postSlug: post.slug,
      postTitle: post.title,
    });
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      {sections?.map((section) => (
        <div key={section.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gold-400">
            {section.name}
          </h2>

          <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
            {section.categories.map((category) => {
              const threadCount = threadCountByCategory.get(category.id) ?? 0;
              const totalPostCount = threadCount + (commentCountByCategory.get(category.id) ?? 0);
              const activity = latestActivityByCategory.get(category.id);

              return (
                <li key={category.id} className="p-4 hover:bg-charcoal-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/c/${category.slug}`} className="min-w-0 sm:flex-1">
                      <span className="font-medium text-green-400">
                        {category.name}
                      </span>
                      {category.description && (
                        <p className="text-sm text-charcoal-400">
                          {category.description}
                        </p>
                      )}
                    </Link>

                    <span className="shrink-0 text-sm text-charcoal-400 sm:text-right">
                      {threadCount} {threadCount === 1 ? "thread" : "threads"}
                      <br />
                      {totalPostCount} {totalPostCount === 1 ? "post" : "posts"}
                    </span>

                    <div className="min-w-0 shrink-0 text-sm sm:w-48">
                      {activity ? (
                        <>
                          <Link
                            href={`/c/${category.slug}/${activity.postSlug}`}
                            className="block truncate text-green-400 hover:underline"
                          >
                            {activity.postTitle}
                          </Link>
                          <p className="truncate text-charcoal-400">
                            by {activity.authorName} &middot;{" "}
                            {formatRelativeTime(new Date(activity.createdAt))}
                          </p>
                        </>
                      ) : (
                        <span className="text-charcoal-500">No activity yet</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </main>
  );
}
