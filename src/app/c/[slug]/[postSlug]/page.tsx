import Link from "next/link";
import { ArrowLeft, Lock, Send } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { getAuthorActivityCounts } from "@/lib/queries/authors";
import { getCommentReactions, getPostReactions } from "@/lib/queries/reactions";
import { getPageRange, getTotalPages } from "@/lib/pagination";
import { isModerator } from "@/lib/roles";
import { PostArticle } from "@/components/post/post-article";
import { CommentItem } from "@/components/post/comment-item";
import { Pagination } from "@/components/pagination";
import { Composer } from "@/components/composer";
import { deletePost, togglePostLock, togglePostPin } from "@/lib/actions/posts";
import { createComment, deleteComment, updateComment } from "@/lib/actions/comments";
import { toggleReaction } from "@/lib/actions/reactions";
import { ErrorBanner } from "@/components/error-banner";
import { PageContainer } from "@/components/page-container";
import { SubmitButton } from "@/components/submit-button";

const COMMENTS_PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);

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
  const { slug: categorySlug, postSlug } = await params;
  const { error, editComment, commentsPage } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const category = await getCategoryBySlug(supabase, categorySlug);
  if (!category) {
    notFound();
  }

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, title, body, image_url, author_id, is_pinned, is_locked, is_deleted, created_at, profiles(username, display_name, avatar_url, role)",
    )
    .eq("category_id", category.id)
    .eq("slug", postSlug)
    .single();

  if (!post || post.is_deleted) {
    notFound();
  }

  const { page, from, to } = getPageRange(commentsPage, COMMENTS_PER_PAGE);
  const { data: comments, count: commentCount } = await supabase
    .from("comments")
    .select(
      "id, body, image_url, author_id, created_at, is_deleted, profiles(username, display_name, avatar_url, role)",
      { count: "exact" },
    )
    .eq("post_id", post.id)
    .order("created_at", { ascending: true })
    .range(from, to);

  const visibleComments = comments?.filter((comment) => !comment.is_deleted) ?? [];
  const totalPages = getTotalPages(commentCount, COMMENTS_PER_PAGE);

  const authorIds = Array.from(new Set([post.author_id, ...visibleComments.map((c) => c.author_id)]));
  const authorActivityCount = await getAuthorActivityCounts(supabase, authorIds);

  const postReaction = await getPostReactions(supabase, post.id, profile?.id);
  const commentReactionsById = await getCommentReactions(
    supabase,
    visibleComments.map((c) => c.id),
    profile?.id,
  );

  const canModerate = isModerator(profile?.role);
  const canEditPost = profile?.id === post.author_id || canModerate;

  return (
    <PageContainer>
      <Link
        href={`/c/${categorySlug}`}
        className="group flex w-fit items-center gap-1.5 text-sm text-charcoal-400 transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 ease-spring group-hover:-translate-x-1" />
        {category.name}
      </Link>

      <ErrorBanner message={error} />

      <PostArticle
        post={{
          id: post.id,
          title: post.title,
          body: post.body,
          imageUrl: post.image_url,
          isPinned: post.is_pinned,
          isLocked: post.is_locked,
          createdAt: post.created_at,
        }}
        author={{
          username: post.profiles?.username,
          displayName: post.profiles?.display_name ?? "Unknown",
          avatarUrl: post.profiles?.avatar_url,
          role: post.profiles?.role,
          postCount: authorActivityCount.get(post.author_id) ?? 0,
        }}
        categorySlug={categorySlug}
        postSlug={postSlug}
        canEdit={canEditPost}
        canModerate={canModerate}
        canReport={Boolean(profile)}
        onTogglePin={togglePostPin.bind(null, categorySlug, postSlug, post.id, post.is_pinned)}
        onToggleLock={togglePostLock.bind(null, categorySlug, postSlug, post.id, post.is_locked)}
        onDelete={deletePost.bind(null, categorySlug, postSlug, post.id)}
        reaction={postReaction}
        reactionAction={toggleReaction.bind(null, categorySlug, postSlug, post.id, null)}
      />

      <section className="flex flex-col gap-4">
        <h2 className="heading flex items-center gap-3 text-lg">
          Replies
          <span className="chip font-sans">{commentCount ?? 0}</span>
          <span className="h-px flex-1 bg-linear-to-r from-gold-700/50 to-transparent" />
        </h2>

        <ul className="flex flex-col gap-3">
          {visibleComments.map((comment, index) => {
            const reaction = commentReactionsById.get(comment.id)!;

            return (
              <CommentItem
                key={comment.id}
                index={index}
                comment={{
                  id: comment.id,
                  body: comment.body,
                  imageUrl: comment.image_url,
                  createdAt: comment.created_at,
                }}
                author={{
                  username: comment.profiles?.username,
                  displayName: comment.profiles?.display_name ?? "Unknown",
                  avatarUrl: comment.profiles?.avatar_url,
                  role: comment.profiles?.role,
                  postCount: authorActivityCount.get(comment.author_id) ?? 0,
                }}
                categorySlug={categorySlug}
                postSlug={postSlug}
                canEdit={profile?.id === comment.author_id || canModerate}
                canModerate={canModerate}
                canReport={Boolean(profile)}
                isEditing={editComment === comment.id}
                onUpdate={updateComment.bind(null, categorySlug, postSlug, comment.id)}
                onDelete={deleteComment.bind(null, categorySlug, postSlug, comment.id)}
                reaction={reaction}
                reactionAction={toggleReaction.bind(null, categorySlug, postSlug, null, comment.id)}
              />
            );
          })}
        </ul>

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath={`/c/${categorySlug}/${postSlug}`}
          param="commentsPage"
        />

        {profile ? (
          post.is_locked ? (
            <p className="panel flex items-center gap-2 px-5 py-4 text-sm text-charcoal-400">
              <Lock className="size-4 text-charcoal-500" aria-hidden="true" />
              This thread is locked, so no new replies can be posted.
            </p>
          ) : (
            <form
              action={createComment.bind(null, categorySlug, postSlug, post.id)}
              encType="multipart/form-data"
              className="panel flex flex-col gap-3 p-4 sm:p-5"
            >
              <p className="heading text-sm">Join the conversation</p>
              <Composer required placeholder="Write a reply..." />
              <SubmitButton className="group btn btn-primary self-end">
                Post reply
                <Send className="size-4 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </SubmitButton>
            </form>
          )
        ) : (
          <p className="panel px-5 py-4 text-sm text-charcoal-400">
            <Link
              href={`/login?next=${encodeURIComponent(`/c/${categorySlug}/${postSlug}`)}`}
              className="font-semibold text-green-400 hover:text-green-300 hover:underline"
            >
              Log in
            </Link>{" "}
            to join the conversation.
          </p>
        )}
      </section>
    </PageContainer>
  );
}
