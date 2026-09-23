import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { Avatar } from "@/components/avatar";

const POSTS_PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return {
    title: category?.name ?? "Category",
    description: category?.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
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

  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data: posts, count } = await supabase
    .from("posts")
    .select(
      "id, title, slug, is_pinned, is_locked, created_at, profiles(username, display_name, avatar_url)",
      { count: "exact" },
    )
    .eq("category_id", category.id)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / POSTS_PER_PAGE));

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
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <Avatar
                  url={post.profiles?.avatar_url}
                  name={post.profiles?.display_name ?? "?"}
                  size={20}
                />
                <p className="text-sm text-charcoal-400">
                  by{" "}
                  {post.profiles?.username ? (
                    <Link
                      href={`/u/${post.profiles.username}`}
                      className="hover:text-charcoal-200"
                    >
                      {post.profiles.display_name}
                    </Link>
                  ) : (
                    "Unknown"
                  )}{" "}
                  &middot; {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-charcoal-500">
            No posts yet. Be the first to start one.
          </li>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 text-sm text-charcoal-400">
          {page > 1 && (
            <Link
              href={`/c/${slug}?page=${page - 1}`}
              className="hover:text-charcoal-200"
            >
              &larr; Previous
            </Link>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/c/${slug}?page=${page + 1}`}
              className="hover:text-charcoal-200"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
