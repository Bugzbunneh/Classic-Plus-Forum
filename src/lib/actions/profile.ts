"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { redirectWithError } from "@/lib/redirect-with-error";
import { getFormString } from "@/lib/form-data";
import { imageExtension, isProvidedFile, validateImage } from "@/lib/storage";

export async function uploadAvatar(formData: FormData) {
  const profile = await requireProfile("/settings");

  const file = formData.get("avatar");
  if (!isProvidedFile(file)) {
    redirectWithError("/settings", "Choose an image first");
  }

  const validationError = validateImage(file);
  if (validationError) {
    redirectWithError("/settings", validationError);
  }

  const supabase = await createClient();
  const path = `${profile.id}/avatar.${imageExtension(file)}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) {
    redirectWithError("/settings", uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", profile.id);
  if (updateError) {
    redirectWithError("/settings", updateError.message);
  }

  revalidatePath("/", "layout");
  redirect("/settings?success=avatar");
}

export async function updateProfile(formData: FormData) {
  const profile = await requireProfile("/settings");

  const displayName = getFormString(formData, "displayName").trim();
  const bio = getFormString(formData, "bio").trim();
  if (!displayName) {
    redirectWithError("/settings", "Display name is required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio: bio || null })
    .eq("id", profile.id);
  if (error) {
    redirectWithError("/settings", error.message);
  }

  revalidatePath("/", "layout");
  redirect("/settings?success=profile");
}
