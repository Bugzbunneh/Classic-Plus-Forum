"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { redirectWithError } from "@/lib/redirect-with-error";
import { uploadPostImage } from "@/lib/storage";

export async function createComment(
  categorySlug: string,
  postSlug: string,
  postId: string,
  formData: FormData,
) {
  const profile = await requireProfile(`/c/${categorySlug}/${postSlug}`);

  const body = (formData.get("body") as string).trim();
  if (!body) {
    return;
  }

  const supabase = await createClient();
  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirectWithError(`/c/${categorySlug}/${postSlug}`, imageError);
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: profile.id,
    body,
    image_url: imageUrl,
  });
  if (error) {
    redirectWithError(`/c/${categorySlug}/${postSlug}`, error.message);
  }

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}

export async function updateComment(
  categorySlug: string,
  postSlug: string,
  commentId: string,
  formData: FormData,
) {
  const profile = await requireProfile(`/c/${categorySlug}/${postSlug}`);

  const body = (formData.get("body") as string).trim();
  if (!body) {
    return;
  }

  const supabase = await createClient();
  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirectWithError(`/c/${categorySlug}/${postSlug}`, imageError);
  }

  await supabase
    .from("comments")
    .update({ body, ...(imageUrl && { image_url: imageUrl }) })
    .eq("id", commentId);

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}

export async function deleteComment(categorySlug: string, postSlug: string, commentId: string) {
  const supabase = await createClient();
  await supabase.from("comments").update({ is_deleted: true }).eq("id", commentId);
  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}
