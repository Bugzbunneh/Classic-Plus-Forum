"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export async function updateRole(userId: string, formData: FormData) {
  const role = formData.get("role") as Role;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/members");
}

export async function toggleBan(userId: string, isBanned: boolean) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_banned: !isBanned }).eq("id", userId);
  revalidatePath("/admin/members");
}
