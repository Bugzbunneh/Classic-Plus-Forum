import Link from "next/link";
import { Flag, Pencil, Trash2 } from "lucide-react";
import { AuthorBox } from "@/components/post/author-box";
import { ReactionButton } from "@/components/post/reaction-button";
import { PostImage } from "@/components/post/post-image";
import { Composer } from "@/components/composer";
import { SubmitButton } from "@/components/submit-button";
import { formatText } from "@/lib/format-text";
import { staggerStyle } from "@/lib/stagger";
import type { Role } from "@/lib/roles";
import type { ReactionInfo } from "@/lib/queries/reactions";

type FormAction = (formData: FormData) => Promise<void>;

export function CommentItem({
  comment,
  author,
  categorySlug,
  postSlug,
  canEdit,
  canModerate,
  canReport,
  isEditing,
  onUpdate,
  onDelete,
  reaction,
  reactionAction,
  index,
}: {
  comment: {
    id: string;
    body: string;
    imageUrl: string | null;
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
  isEditing: boolean;
  onUpdate: FormAction;
  onDelete: FormAction;
  reaction: ReactionInfo;
  reactionAction: FormAction;
  /** Position in the list, to stagger the entrance animation. */
  index: number;
}) {
  return (
    <li
      id={`comment-${comment.id}`}
      className="panel stagger flex animate-rise-in flex-col gap-3 p-4 sm:flex-row sm:p-5"
      style={staggerStyle(index)}
    >
      <AuthorBox
        username={author.username}
        displayName={author.displayName}
        avatarUrl={author.avatarUrl}
        role={author.role}
        postCount={author.postCount}
        compact
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <time dateTime={comment.createdAt} className="text-xs text-charcoal-500">
          {new Date(comment.createdAt).toLocaleString()}
        </time>

        {isEditing ? (
          <form action={onUpdate} encType="multipart/form-data" className="flex flex-col gap-3">
            <Composer defaultValue={comment.body} existingImageUrl={comment.imageUrl} required rows={3} />
            <div className="flex gap-2">
              <SubmitButton className="btn btn-primary btn-sm">Save</SubmitButton>
              <Link href={`/c/${categorySlug}/${postSlug}`} className="btn btn-secondary btn-sm">
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <>
            <div className="leading-relaxed whitespace-pre-wrap text-charcoal-200">
              {formatText(comment.body)}
            </div>
            {comment.imageUrl && <PostImage url={comment.imageUrl} maxHeightClass="max-h-72" />}
          </>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <ReactionButton
            action={reactionAction}
            count={reaction.count}
            hasReacted={reaction.hasReacted}
            reactorNames={reaction.reactorNames}
          />

          <div className="flex flex-wrap items-center gap-0.5">
            {canEdit && !isEditing && (
              <Link
                href={`/c/${categorySlug}/${postSlug}?editComment=${comment.id}#comment-${comment.id}`}
                className="btn btn-ghost btn-sm"
              >
                <Pencil className="size-3.5" aria-hidden="true" /> Edit
              </Link>
            )}
            {canReport && (
              <Link href={`/report?commentId=${comment.id}`} className="btn btn-ghost btn-sm">
                <Flag className="size-3.5" aria-hidden="true" /> Report
              </Link>
            )}
            {canModerate && (
              <form action={onDelete}>
                <SubmitButton className="btn btn-danger btn-sm">
                  <Trash2 className="size-3.5" aria-hidden="true" /> Delete
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
