import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import {
  createComment,
  deleteComment,
  deletePost,
  togglePostLock,
  togglePostPin,
} from "@/lib/actions/posts";

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug, postSlug } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, title, body, is_pinned, is_locked, is_deleted, created_at, profiles(display_name)",
    )
    .eq("category_id", category.id)
    .eq("slug", postSlug)
    .single();

  if (!post || post.is_deleted) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, is_deleted, profiles(display_name)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  const visibleComments = comments?.filter((comment) => !comment.is_deleted) ?? [];
  const isModerator = profile?.role === "admin" || profile?.role === "owner";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <Link
        href={`/c/${slug}`}
        className="text-sm text-charcoal-400 hover:text-charcoal-200"
      >
        &larr; {category.name}
      </Link>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}

      <article className="flex flex-col gap-2 rounded border border-charcoal-700 bg-charcoal-900 p-4">
        <div className="flex items-start justify-between gap-4">
          <h1
            className={`text-xl font-semibold ${post.is_pinned ? "text-gold-400" : "text-charcoal-200"}`}
          >
            {post.is_pinned && "📌 "}
            {post.title}
          </h1>
          {isModerator && (
            <div className="flex shrink-0 gap-3 text-xs">
              <form
                action={togglePostPin.bind(
                  null,
                  slug,
                  postSlug,
                  post.id,
                  post.is_pinned,
                )}
              >
                <button
                  type="submit"
                  className="text-charcoal-400 hover:text-gold-400"
                >
                  {post.is_pinned ? "Unpin" : "Pin"}
                </button>
              </form>
              <form
                action={togglePostLock.bind(
                  null,
                  slug,
                  postSlug,
                  post.id,
                  post.is_locked,
                )}
              >
                <button
                  type="submit"
                  className="text-charcoal-400 hover:text-charcoal-200"
                >
                  {post.is_locked ? "Unlock" : "Lock"}
                </button>
              </form>
              <form action={deletePost.bind(null, slug, post.id)}>
                <button
                  type="submit"
                  className="text-danger-400 hover:text-danger-500"
                >
                  Delete
                </button>
              </form>
            </div>
          )}
        </div>
        <p className="text-sm text-charcoal-400">
          by {post.profiles?.display_name ?? "Unknown"} &middot;{" "}
          {new Date(post.created_at).toLocaleString()}
          {post.is_locked && (
            <span className="ml-2 uppercase text-charcoal-500">locked</span>
          )}
        </p>
        <p className="whitespace-pre-wrap text-charcoal-200">{post.body}</p>
      </article>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-charcoal-200">
          Comments ({visibleComments.length})
        </h2>

        <ul className="flex flex-col gap-3">
          {visibleComments.map((comment) => (
            <li
              key={comment.id}
              className="rounded border border-charcoal-700 bg-charcoal-900 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-charcoal-400">
                  {comment.profiles?.display_name ?? "Unknown"} &middot;{" "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                {isModerator && (
                  <form
                    action={deleteComment.bind(null, slug, postSlug, comment.id)}
                  >
                    <button
                      type="submit"
                      className="text-xs text-danger-400 hover:text-danger-500"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
              <p className="whitespace-pre-wrap text-charcoal-200">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>

        {profile ? (
          post.is_locked ? (
            <p className="text-sm text-charcoal-500">This post is locked.</p>
          ) : (
            <form
              action={createComment.bind(null, slug, postSlug, post.id)}
              className="flex flex-col gap-2"
            >
              <textarea
                name="body"
                required
                rows={4}
                placeholder="Write a reply..."
                className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
              />
              <button
                type="submit"
                className="self-start rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                Reply
              </button>
            </form>
          )
        ) : (
          <p className="text-sm text-charcoal-500">
            <Link href="/login" className="text-green-400 hover:underline">
              Log in
            </Link>{" "}
            to reply.
          </p>
        )}
      </section>
    </main>
  );
}
