"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";

export async function markAllNotificationsRead() {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
