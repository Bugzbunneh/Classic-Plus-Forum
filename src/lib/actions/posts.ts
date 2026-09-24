"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { redirectWithError } from "@/lib/redirect-with-error";
import { uniqueSlug } from "@/lib/slug";
import { uploadPostImage } from "@/lib/storage";

export async function createPost(categorySlug: string, formData: FormData) {
  const profile = await requireProfile(`/c/${categorySlug}/new`);

  const title = (formData.get("title") as string).trim();
  const body = (formData.get("body") as string).trim();
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
  const profile = await requireProfile(`/c/${categorySlug}/${postSlug}/edit`);

  const title = (formData.get("title") as string).trim();
  const body = (formData.get("body") as string).trim();
  if (!title || !body) {
    redirectWithError(`/c/${categorySlug}/${postSlug}/edit`, "Title and message are required");
  }

  const supabase = await createClient();
  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirectWithError(`/c/${categorySlug}/${postSlug}/edit`, imageError);
  }

  const { error } = await supabase
    .from("posts")
    .update({ title, body, ...(imageUrl && { image_url: imageUrl }) })
    .eq("id", postId);
  if (error) {
    redirectWithError(`/c/${categorySlug}/${postSlug}/edit`, error.message);
  }

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
  redirect(`/c/${categorySlug}/${postSlug}`);
}

export async function togglePostPin(
  categorySlug: string,
  postSlug: string,
  postId: string,
  isPinned: boolean,
) {
  const supabase = await createClient();
  await supabase.from("posts").update({ is_pinned: !isPinned }).eq("id", postId);
  revalidatePath(`/c/${categorySlug}/${postSlug}`);
  revalidatePath(`/c/${categorySlug}`);
}

export async function togglePostLock(
  categorySlug: string,
  postSlug: string,
  postId: string,
  isLocked: boolean,
) {
  const supabase = await createClient();
  await supabase.from("posts").update({ is_locked: !isLocked }).eq("id", postId);
  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}

export async function deletePost(categorySlug: string, postId: string) {
  const supabase = await createClient();
  await supabase.from("posts").update({ is_deleted: true }).eq("id", postId);
  revalidatePath(`/c/${categorySlug}`);
  redirect(`/c/${categorySlug}`);
}
