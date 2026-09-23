"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";

export async function uploadAvatar(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/settings");
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    redirect(`/settings?error=${encodeURIComponent("Choose an image first")}`);
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${profile.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    redirect(`/settings?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", profile.id);

  if (updateError) {
    redirect(`/settings?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/settings?success=1");
}
