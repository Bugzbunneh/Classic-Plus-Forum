import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, title, slug, is_pinned, is_locked, created_at, profiles(display_name)",
    )
    .eq("category_id", category.id)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-200">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-charcoal-400">
              {category.description}
            </p>
          )}
        </div>
        {profile && (
          <Link
            href={`/c/${slug}/new`}
            className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600"
          >
            New post
          </Link>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
        {posts?.length ? (
          posts.map((post) => (
            <li key={post.id} className="p-4 hover:bg-charcoal-800">
              <Link href={`/c/${slug}/${post.slug}`} className="block">
                <span
                  className={`font-medium ${post.is_pinned ? "text-gold-400" : "text-green-400"}`}
                >
                  {post.is_pinned && "📌 "}
                  {post.title}
                </span>
                {post.is_locked && (
                  <span className="ml-2 text-xs uppercase text-charcoal-500">
                    locked
                  </span>
                )}
                <p className="text-sm text-charcoal-400">
                  by {post.profiles?.display_name ?? "Unknown"} &middot;{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-charcoal-500">
            No posts yet. Be the first to start one.
          </li>
        )}
      </ul>
    </main>
  );
}
