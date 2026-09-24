"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";

export async function toggleReaction(
  categorySlug: string,
  postSlug: string,
  postId: string | null,
  commentId: string | null,
  hasReacted: boolean,
) {
  const profile = await requireProfile(`/c/${categorySlug}/${postSlug}`);
  const supabase = await createClient();

  if (hasReacted) {
    const query = supabase.from("reactions").delete().eq("user_id", profile.id);
    await (postId ? query.eq("post_id", postId) : query.eq("comment_id", commentId!));
  } else {
    await supabase
      .from("reactions")
      .insert({ user_id: profile.id, post_id: postId, comment_id: commentId });
  }

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}
