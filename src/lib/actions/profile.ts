"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { redirectWithError } from "@/lib/redirect-with-error";

export async function uploadAvatar(formData: FormData) {
  const profile = await requireProfile("/settings");

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    redirectWithError("/settings", "Choose an image first");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${profile.id}/avatar.${ext}`;

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

  const displayName = (formData.get("displayName") as string).trim();
  const bio = (formData.get("bio") as string).trim();
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
