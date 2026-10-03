"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { redirectWithError } from "@/lib/redirect-with-error";
import { ensureWriteSucceeded } from "@/lib/ensure-write-succeeded";
import { getFormString } from "@/lib/form-data";
import { uploadPostImage } from "@/lib/storage";

export async function createComment(
  categorySlug: string,
  postSlug: string,
  postId: string,
  formData: FormData,
) {
  const postPath = `/c/${categorySlug}/${postSlug}`;
  const profile = await requireProfile(postPath);

  const body = getFormString(formData, "body").trim();
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
    redirectWithError(postPath, imageError);
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: profile.id,
    body,
    image_url: imageUrl,
  });
  if (error) {
    redirectWithError(postPath, error.message);
  }

  revalidatePath(postPath);
}

export async function updateComment(
  categorySlug: string,
  postSlug: string,
  commentId: string,
  formData: FormData,
) {
  const postPath = `/c/${categorySlug}/${postSlug}`;
  const profile = await requireProfile(postPath);

  const body = getFormString(formData, "body").trim();
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
    redirectWithError(postPath, imageError);
  }

  const result = await supabase
    .from("comments")
    .update({ body, ...(imageUrl && { image_url: imageUrl }) })
    .eq("id", commentId)
    .select("id");
  ensureWriteSucceeded(result, postPath);

  revalidatePath(postPath);
}

export async function deleteComment(categorySlug: string, postSlug: string, commentId: string) {
  const postPath = `/c/${categorySlug}/${postSlug}`;
  const supabase = await createClient();

  const result = await supabase
    .from("comments")
    .update({ is_deleted: true })
    .eq("id", commentId)
    .select("id");
  ensureWriteSucceeded(result, postPath);

  revalidatePath(postPath);
}
