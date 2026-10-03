"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { redirectWithError } from "@/lib/redirect-with-error";

const UNIQUE_VIOLATION = "23505";

/**
 * Removes the user's reaction if they have one, otherwise adds it. Decided
 * here rather than from what the page showed, so a stale tab or a
 * double-click can't get out of sync with the database.
 */
export async function toggleReaction(
  categorySlug: string,
  postSlug: string,
  postId: string | null,
  commentId: string | null,
) {
  const postPath = `/c/${categorySlug}/${postSlug}`;
  const profile = await requireProfile(postPath);
  const supabase = await createClient();

  const target = postId ? { post_id: postId } : { comment_id: commentId! };

  const { data: removed, error: removeError } = await supabase
    .from("reactions")
    .delete()
    .eq("user_id", profile.id)
    .match(target)
    .select("id");
  if (removeError) {
    redirectWithError(postPath, removeError.message);
  }

  if (!removed.length) {
    const { error: addError } = await supabase
      .from("reactions")
      .insert({ user_id: profile.id, ...target });

    // A simultaneous click already added it, which is the outcome we wanted.
    const alreadyReacted = addError?.code === UNIQUE_VIOLATION;
    if (addError && !alreadyReacted) {
      redirectWithError(postPath, addError.message);
    }
  }

  revalidatePath(postPath);
}
