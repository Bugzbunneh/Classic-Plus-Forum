import Link from "next/link";
import { AuthorBox } from "@/components/post/author-box";
import { ReactionButton } from "@/components/post/reaction-button";
import { formatText } from "@/lib/format-text";
import type { Role } from "@/lib/roles";
import type { ReactionInfo } from "@/lib/queries/reactions";

type FormAction = (formData: FormData) => Promise<void>;

export function PostArticle({
  post,
  author,
  categorySlug,
  postSlug,
  canEdit,
  canModerate,
  canReport,
  onTogglePin,
  onToggleLock,
  onDelete,
  reaction,
  reactionAction,
}: {
  post: {
    id: string;
    title: string;
    body: string;
    imageUrl: string | null;
    isPinned: boolean;
    isLocked: boolean;
    createdAt: string;
  };
  author: {
    username: string | null | undefined;
    displayName: string;
    avatarUrl: string | null | undefined;
    role: Role | null | undefined;
    postCount: number;
  };
  categorySlug: string;
  postSlug: string;
  canEdit: boolean;
  canModerate: boolean;
  canReport: boolean;
  onTogglePin: FormAction;
  onToggleLock: FormAction;
  onDelete: FormAction;
  reaction: ReactionInfo;
  reactionAction: FormAction;
}) {
  return (
    <article className="flex flex-col gap-4 rounded border border-charcoal-700 bg-charcoal-900 p-4 sm:flex-row">
      <AuthorBox
        username={author.username}
        displayName={author.displayName}
        avatarUrl={author.avatarUrl}
        role={author.role}
        postCount={author.postCount}
        className="sm:border-r sm:border-charcoal-700 sm:pr-4"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h1
            className={`text-xl font-semibold ${post.isPinned ? "text-gold-400" : "text-charcoal-200"}`}
          >
            {post.isPinned && "📌 "}
            {post.title}
          </h1>
          <div className="flex shrink-0 gap-3 text-xs">
            {canEdit && (
              <Link
                href={`/c/${categorySlug}/${postSlug}/edit`}
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Edit
              </Link>
            )}
            {canReport && (
              <Link
                href={`/report?postId=${post.id}`}
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Report
              </Link>
            )}
            {canModerate && (
              <>
                <form action={onTogglePin}>
                  <button type="submit" className="text-charcoal-400 hover:text-gold-400">
                    {post.isPinned ? "Unpin" : "Pin"}
                  </button>
                </form>
                <form action={onToggleLock}>
                  <button type="submit" className="text-charcoal-400 hover:text-charcoal-200">
                    {post.isLocked ? "Unlock" : "Lock"}
                  </button>
                </form>
                <form action={onDelete}>
                  <button type="submit" className="text-danger-400 hover:text-danger-500">
                    Delete
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-charcoal-400">
          {new Date(post.createdAt).toLocaleString()}
          {post.isLocked && <span className="ml-2 uppercase text-charcoal-500">locked</span>}
        </p>
        <p className="whitespace-pre-wrap text-charcoal-200">{formatText(post.body)}</p>
        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt=""
            className="max-h-96 w-fit max-w-full rounded border border-charcoal-700 object-contain"
          />
        )}
        <ReactionButton
          action={reactionAction}
          count={reaction.count}
          hasReacted={reaction.hasReacted}
          reactorNames={reaction.reactorNames}
        />
      </div>
    </article>
  );
}
