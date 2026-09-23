"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { uniqueSlug } from "@/lib/slug";
import { uploadPostImage } from "@/lib/storage";

export async function createPost(categorySlug: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/c/${categorySlug}/new`)}`);
  }

  const title = (formData.get("title") as string).trim();
  const body = (formData.get("body") as string).trim();

  if (!title || !body) {
    redirect(
      `/c/${categorySlug}/new?error=${encodeURIComponent("Title and message are required")}`,
    );
  }

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    redirect(`/c/${categorySlug}?error=${encodeURIComponent("Category not found")}`);
  }

  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirect(`/c/${categorySlug}/new?error=${encodeURIComponent(imageError)}`);
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
    redirect(
      `/c/${categorySlug}/new?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/c/${categorySlug}`);
  redirect(`/c/${categorySlug}/${slug}`);
}

export async function createComment(
  categorySlug: string,
  postSlug: string,
  postId: string,
  formData: FormData,
) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(
      `/login?next=${encodeURIComponent(`/c/${categorySlug}/${postSlug}`)}`,
    );
  }

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
    redirect(
      `/c/${categorySlug}/${postSlug}?error=${encodeURIComponent(imageError)}`,
    );
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: profile.id,
    body,
    image_url: imageUrl,
  });

  if (error) {
    redirect(
      `/c/${categorySlug}/${postSlug}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
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

export async function deleteComment(
  categorySlug: string,
  postSlug: string,
  commentId: string,
) {
  const supabase = await createClient();
  await supabase.from("comments").update({ is_deleted: true }).eq("id", commentId);
  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}

export async function updatePost(
  categorySlug: string,
  postSlug: string,
  postId: string,
  formData: FormData,
) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/c/${categorySlug}/${postSlug}/edit`)}`);
  }

  const title = (formData.get("title") as string).trim();
  const body = (formData.get("body") as string).trim();

  if (!title || !body) {
    redirect(
      `/c/${categorySlug}/${postSlug}/edit?error=${encodeURIComponent("Title and message are required")}`,
    );
  }

  const supabase = await createClient();

  const { url: imageUrl, error: imageError } = await uploadPostImage(
    supabase,
    profile.id,
    formData.get("image"),
  );
  if (imageError) {
    redirect(
      `/c/${categorySlug}/${postSlug}/edit?error=${encodeURIComponent(imageError)}`,
    );
  }

  const { error } = await supabase
    .from("posts")
    .update({ title, body, ...(imageUrl && { image_url: imageUrl }) })
    .eq("id", postId);

  if (error) {
    redirect(
      `/c/${categorySlug}/${postSlug}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/c/${categorySlug}/${postSlug}`);
  redirect(`/c/${categorySlug}/${postSlug}`);
}

export async function updateComment(
  categorySlug: string,
  postSlug: string,
  commentId: string,
  formData: FormData,
) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/c/${categorySlug}/${postSlug}`)}`);
  }

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
    redirect(
      `/c/${categorySlug}/${postSlug}?error=${encodeURIComponent(imageError)}`,
    );
  }

  await supabase
    .from("comments")
    .update({ body, ...(imageUrl && { image_url: imageUrl }) })
    .eq("id", commentId);
  revalidatePath(`/c/${categorySlug}/${postSlug}`);
}

export async function toggleReaction(
  categorySlug: string,
  postSlug: string,
  postId: string | null,
  commentId: string | null,
  hasReacted: boolean,
) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/c/${categorySlug}/${postSlug}`)}`);
  }

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
