import Link from "next/link";
import { Flag, Lock, LockOpen, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { AuthorBox } from "@/components/post/author-box";
import { ReactionButton } from "@/components/post/reaction-button";
import { PostImage } from "@/components/post/post-image";
import { SubmitButton } from "@/components/submit-button";
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
    <article className="panel flex animate-rise-in flex-col gap-4 p-5 sm:flex-row sm:p-6">
      <AuthorBox
        username={author.username}
        displayName={author.displayName}
        avatarUrl={author.avatarUrl}
        role={author.role}
        postCount={author.postCount}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {post.isPinned && (
            <span className="chip border-gold-700/70 text-gold-400">
              <Pin className="size-3" aria-hidden="true" /> Pinned
            </span>
          )}
          {post.isLocked && (
            <span className="chip">
              <Lock className="size-3" aria-hidden="true" /> Locked
            </span>
          )}
          <time dateTime={post.createdAt} className="text-xs text-charcoal-500">
            {new Date(post.createdAt).toLocaleString()}
          </time>
        </div>

        <h1 className={`heading text-2xl leading-tight sm:text-3xl ${post.isPinned ? "text-gold-gradient" : ""}`}>
          {post.title}
        </h1>

        <div className="text-[0.95rem] leading-relaxed whitespace-pre-wrap text-charcoal-200">
          {formatText(post.body)}
        </div>

        {post.imageUrl && <PostImage url={post.imageUrl} maxHeightClass="max-h-[28rem]" />}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-charcoal-700/60 pt-3">
          <ReactionButton
            action={reactionAction}
            count={reaction.count}
            hasReacted={reaction.hasReacted}
            reactorNames={reaction.reactorNames}
          />

          <div className="flex flex-wrap items-center gap-0.5">
            {canEdit && (
              <Link href={`/c/${categorySlug}/${postSlug}/edit`} className="btn btn-ghost btn-sm">
                <Pencil className="size-3.5" aria-hidden="true" /> Edit
              </Link>
            )}
            {canReport && (
              <Link href={`/report?postId=${post.id}`} className="btn btn-ghost btn-sm">
                <Flag className="size-3.5" aria-hidden="true" /> Report
              </Link>
            )}
            {canModerate && (
              <>
                <form action={onTogglePin}>
                  <SubmitButton className="btn btn-ghost btn-sm hover:text-gold-300">
                    {post.isPinned ? (
                      <PinOff className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Pin className="size-3.5" aria-hidden="true" />
                    )}
                    {post.isPinned ? "Unpin" : "Pin"}
                  </SubmitButton>
                </form>
                <form action={onToggleLock}>
                  <SubmitButton className="btn btn-ghost btn-sm">
                    {post.isLocked ? (
                      <LockOpen className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Lock className="size-3.5" aria-hidden="true" />
                    )}
                    {post.isLocked ? "Unlock" : "Lock"}
                  </SubmitButton>
                </form>
                <form action={onDelete}>
                  <SubmitButton className="btn btn-danger btn-sm">
                    <Trash2 className="size-3.5" aria-hidden="true" /> Delete
                  </SubmitButton>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
