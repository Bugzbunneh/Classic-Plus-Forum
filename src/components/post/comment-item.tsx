import Link from "next/link";
import { AuthorBox } from "@/components/post/author-box";
import { ReactionButton } from "@/components/post/reaction-button";
import { Composer } from "@/components/composer";
import { formatText } from "@/lib/format-text";
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
}) {
  return (
    <li className="flex flex-col gap-3 rounded border border-charcoal-700 bg-charcoal-900 p-3 sm:flex-row">
      <AuthorBox
        username={author.username}
        displayName={author.displayName}
        avatarUrl={author.avatarUrl}
        role={author.role}
        postCount={author.postCount}
        compact
        className="sm:border-r sm:border-charcoal-700 sm:pr-3"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-400">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
          <div className="flex gap-2 text-xs">
            {canEdit && !isEditing && (
              <Link
                href={`/c/${categorySlug}/${postSlug}?editComment=${comment.id}#comment-${comment.id}`}
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Edit
              </Link>
            )}
            {canReport && (
              <Link
                href={`/report?commentId=${comment.id}`}
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Report
              </Link>
            )}
            {canModerate && (
              <form action={onDelete}>
                <button type="submit" className="text-danger-400 hover:text-danger-500">
                  Delete
                </button>
              </form>
            )}
          </div>
        </div>

        {isEditing ? (
          <form action={onUpdate} encType="multipart/form-data" className="flex flex-col gap-2">
            <Composer
              defaultValue={comment.body}
              existingImageUrl={comment.imageUrl}
              required
              rows={3}
              textareaClassName="bg-charcoal-950"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-green-700 px-3 py-1 text-xs font-medium text-white hover:bg-green-600"
              >
                Save
              </button>
              <Link
                href={`/c/${categorySlug}/${postSlug}`}
                className="rounded border border-charcoal-600 px-3 py-1 text-xs text-charcoal-300 hover:text-charcoal-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-charcoal-200">{formatText(comment.body)}</p>
            {comment.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={comment.imageUrl}
                alt=""
                className="max-h-64 w-fit max-w-full rounded border border-charcoal-700 object-contain"
              />
            )}
          </>
        )}

        <ReactionButton
          action={reactionAction}
          count={reaction.count}
          hasReacted={reaction.hasReacted}
          reactorNames={reaction.reactorNames}
        />
      </div>
    </li>
  );
}
