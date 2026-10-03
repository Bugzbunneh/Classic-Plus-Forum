"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { redirectWithError } from "@/lib/redirect-with-error";
import { ensureWriteSucceeded } from "@/lib/ensure-write-succeeded";
import { getFormString } from "@/lib/form-data";
import { uniqueSlug } from "@/lib/slug";
import { uploadPostImage } from "@/lib/storage";

export async function createPost(categorySlug: string, formData: FormData) {
  const profile = await requireProfile(`/c/${categorySlug}/new`);

  const title = getFormString(formData, "title").trim();
  const body = getFormString(formData, "body").trim();
  if (!title || !body) {
    redirectWithError(`/c/${categorySlug}/new`, "Title and message are required");
  }

  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, categorySlug);
  if (!category) {
    redirectWithError(`/c/${categorySlug}`, "Category not found");
  }

  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirectWithError(`/c/${categorySlug}/new`, imageError);
  }

  const slug = uniqueSlug(title);
  const { error } = await supabase.from("posts").insert({
    category_id: category.id,
    author_id: profile.id,
    title,
    body,
    slug,
    image_url: imageUrl,
  });
  if (error) {
    redirectWithError(`/c/${categorySlug}/new`, error.message);
  }

  revalidatePath(`/c/${categorySlug}`);
  redirect(`/c/${categorySlug}/${slug}`);
}

export async function updatePost(
  categorySlug: string,
  postSlug: string,
  postId: string,
  formData: FormData,
) {
  const editPath = `/c/${categorySlug}/${postSlug}/edit`;
  const profile = await requireProfile(editPath);

  const title = getFormString(formData, "title").trim();
  const body = getFormString(formData, "body").trim();
  if (!title || !body) {
    redirectWithError(editPath, "Title and message are required");
  }

  const supabase = await createClient();
  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirectWithError(editPath, imageError);
  }

  const result = await supabase
    .from("posts")
    .update({ title, body, ...(imageUrl && { image_url: imageUrl }) })
    .eq("id", postId)
    .select("id");
  ensureWriteSucceeded(result, editPath);

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
  redirect(`/c/${categorySlug}/${postSlug}`);
}

export async function togglePostPin(
  categorySlug: string,
  postSlug: string,
  postId: string,
  isPinned: boolean,
) {
  const postPath = `/c/${categorySlug}/${postSlug}`;
  const supabase = await createClient();

  const result = await supabase
    .from("posts")
    .update({ is_pinned: !isPinned })
    .eq("id", postId)
    .select("id");
  ensureWriteSucceeded(result, postPath);

  revalidatePath(postPath);
  revalidatePath(`/c/${categorySlug}`);
}

export async function togglePostLock(
  categorySlug: string,
  postSlug: string,
  postId: string,
  isLocked: boolean,
) {
  const postPath = `/c/${categorySlug}/${postSlug}`;
  const supabase = await createClient();

  const result = await supabase
    .from("posts")
    .update({ is_locked: !isLocked })
    .eq("id", postId)
    .select("id");
  ensureWriteSucceeded(result, postPath);

  revalidatePath(postPath);
}

export async function deletePost(categorySlug: string, postSlug: string, postId: string) {
  const supabase = await createClient();

  const result = await supabase
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", postId)
    .select("id");
  ensureWriteSucceeded(result, `/c/${categorySlug}/${postSlug}`);

  revalidatePath(`/c/${categorySlug}`);
  redirect(`/c/${categorySlug}`);
}
