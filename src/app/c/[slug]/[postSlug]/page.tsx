import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { formatText } from "@/lib/format-text";
import { Avatar } from "@/components/avatar";
import { ReactionButton } from "@/components/reaction-button";
import {
  createComment,
  deleteComment,
  deletePost,
  toggleReaction,
  togglePostLock,
  togglePostPin,
  updateComment,
} from "@/lib/actions/posts";

const COMMENTS_PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  const { data: post } = category
    ? await supabase
        .from("posts")
        .select("title")
        .eq("category_id", category.id)
        .eq("slug", postSlug)
        .single()
    : { data: null };

  return { title: post?.title ?? "Post" };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ error?: string; editComment?: string; commentsPage?: string }>;
}) {
  const { slug, postSlug } = await params;
  const { error, editComment, commentsPage } = await searchParams;
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
      "id, title, body, image_url, author_id, is_pinned, is_locked, is_deleted, created_at, profiles(username, display_name, avatar_url)",
    )
    .eq("category_id", category.id)
    .eq("slug", postSlug)
    .single();

  if (!post || post.is_deleted) {
    notFound();
  }

  const page = Math.max(1, Number(commentsPage) || 1);
  const from = (page - 1) * COMMENTS_PER_PAGE;
  const to = from + COMMENTS_PER_PAGE - 1;

  const { data: comments, count: commentCount } = await supabase
    .from("comments")
    .select(
      "id, body, image_url, author_id, created_at, is_deleted, profiles(username, display_name, avatar_url)",
      { count: "exact" },
    )
    .eq("post_id", post.id)
    .order("created_at", { ascending: true })
    .range(from, to);

  const visibleComments = comments?.filter((comment) => !comment.is_deleted) ?? [];
  const totalPages = Math.max(1, Math.ceil((commentCount ?? 0) / COMMENTS_PER_PAGE));

  const { data: postReactions } = await supabase
    .from("reactions")
    .select("user_id, profiles(display_name)")
    .eq("post_id", post.id);
  const postReactionCount = postReactions?.length ?? 0;
  const postReactorNames = postReactions?.map((r) => r.profiles?.display_name ?? "Unknown") ?? [];
  const hasReactedToPost = profile
    ? (postReactions?.some((r) => r.user_id === profile.id) ?? false)
    : false;

  const commentIds = visibleComments.map((c) => c.id);
  const { data: commentReactions } = commentIds.length
    ? await supabase
        .from("reactions")
        .select("comment_id, user_id, profiles(display_name)")
        .in("comment_id", commentIds)
    : {
        data: [] as {
          comment_id: string | null;
          user_id: string;
          profiles: { display_name: string } | null;
        }[],
      };

  const isModerator = profile?.role === "admin" || profile?.role === "owner";
  const canEditPost = profile?.id === post.author_id || isModerator;

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
          <div className="flex shrink-0 gap-3 text-xs">
            {canEditPost && (
              <Link
                href={`/c/${slug}/${postSlug}/edit`}
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Edit
              </Link>
            )}
            {profile && (
              <Link
                href={`/report?postId=${post.id}`}
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Report
              </Link>
            )}
            {isModerator && (
              <>
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
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-charcoal-400">
          <Avatar
            url={post.profiles?.avatar_url}
            name={post.profiles?.display_name ?? "?"}
            size={24}
          />
          <p>
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
            &middot; {new Date(post.created_at).toLocaleString()}
            {post.is_locked && (
              <span className="ml-2 uppercase text-charcoal-500">locked</span>
            )}
          </p>
        </div>
        <p className="whitespace-pre-wrap text-charcoal-200">
          {formatText(post.body)}
        </p>
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            className="max-h-96 w-fit max-w-full rounded border border-charcoal-700 object-contain"
          />
        )}
        <ReactionButton
          action={toggleReaction.bind(null, slug, postSlug, post.id, null, hasReactedToPost)}
          count={postReactionCount}
          hasReacted={hasReactedToPost}
          reactorNames={postReactorNames}
        />
      </article>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-charcoal-200">
          Comments ({commentCount ?? 0})
        </h2>

        <ul className="flex flex-col gap-3">
          {visibleComments.map((comment) => {
            const reactionsForComment = commentReactions?.filter(
              (r) => r.comment_id === comment.id,
            );
            const reactionCount = reactionsForComment?.length ?? 0;
            const hasReacted = profile
              ? (reactionsForComment?.some((r) => r.user_id === profile.id) ?? false)
              : false;
            const canEditComment = profile?.id === comment.author_id || isModerator;
            const isEditingThis = editComment === comment.id;

            return (
              <li
                key={comment.id}
                className="rounded border border-charcoal-700 bg-charcoal-900 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      url={comment.profiles?.avatar_url}
                      name={comment.profiles?.display_name ?? "?"}
                      size={24}
                    />
                    <p className="text-sm text-charcoal-400">
                      {comment.profiles?.username ? (
                        <Link
                          href={`/u/${comment.profiles.username}`}
                          className="hover:text-charcoal-200"
                        >
                          {comment.profiles.display_name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}{" "}
                      &middot; {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {canEditComment && !isEditingThis && (
                      <Link
                        href={`/c/${slug}/${postSlug}?editComment=${comment.id}#comment-${comment.id}`}
                        className="text-charcoal-400 hover:text-charcoal-200"
                      >
                        Edit
                      </Link>
                    )}
                    {profile && (
                      <Link
                        href={`/report?commentId=${comment.id}`}
                        className="text-charcoal-400 hover:text-charcoal-200"
                      >
                        Report
                      </Link>
                    )}
                    {isModerator && (
                      <form
                        action={deleteComment.bind(null, slug, postSlug, comment.id)}
                      >
                        <button
                          type="submit"
                          className="text-danger-400 hover:text-danger-500"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {isEditingThis ? (
                  <form
                    action={updateComment.bind(null, slug, postSlug, comment.id)}
                    encType="multipart/form-data"
                    className="mt-2 flex flex-col gap-2"
                  >
                    <textarea
                      name="body"
                      required
                      rows={3}
                      defaultValue={comment.body}
                      className="rounded border border-charcoal-600 bg-charcoal-950 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
                    />
                    {comment.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comment.image_url}
                        alt=""
                        className="max-h-32 w-fit rounded border border-charcoal-700 object-cover"
                      />
                    )}
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      className="text-xs text-charcoal-300"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-green-700 px-3 py-1 text-xs font-medium text-white hover:bg-green-600"
                      >
                        Save
                      </button>
                      <Link
                        href={`/c/${slug}/${postSlug}`}
                        className="rounded border border-charcoal-600 px-3 py-1 text-xs text-charcoal-300 hover:text-charcoal-100"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-charcoal-200">
                      {formatText(comment.body)}
                    </p>
                    {comment.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comment.image_url}
                        alt=""
                        className="mt-2 max-h-64 w-fit max-w-full rounded border border-charcoal-700 object-contain"
                      />
                    )}
                  </>
                )}

                <div className="mt-2">
                  <ReactionButton
                    action={toggleReaction.bind(
                      null,
                      slug,
                      postSlug,
                      null,
                      comment.id,
                      hasReacted,
                    )}
                    count={reactionCount}
                    hasReacted={hasReacted}
                    reactorNames={
                      reactionsForComment?.map((r) => r.profiles?.display_name ?? "Unknown") ?? []
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center gap-4 text-sm text-charcoal-400">
            {page > 1 && (
              <Link
                href={`/c/${slug}/${postSlug}?commentsPage=${page - 1}`}
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
                href={`/c/${slug}/${postSlug}?commentsPage=${page + 1}`}
                className="hover:text-charcoal-200"
              >
                Next &rarr;
              </Link>
            )}
          </div>
        )}

        {profile ? (
          post.is_locked ? (
            <p className="text-sm text-charcoal-500">This post is locked.</p>
          ) : (
            <form
              action={createComment.bind(null, slug, postSlug, post.id)}
              encType="multipart/form-data"
              className="flex flex-col gap-2"
            >
              <textarea
                name="body"
                required
                rows={4}
                placeholder="Write a reply..."
                className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
              />
              <input
                name="image"
                type="file"
                accept="image/*"
                className="text-sm text-charcoal-300"
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
