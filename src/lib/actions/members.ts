"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureWriteSucceeded } from "@/lib/ensure-write-succeeded";
import { getFormString } from "@/lib/form-data";
import type { Role } from "@/lib/roles";

const MEMBERS_PATH = "/admin/members";

export async function updateRole(userId: string, formData: FormData) {
  // Postgres rejects anything that isn't a valid user_role enum value.
  const role = getFormString(formData, "role") as Role;
  const supabase = await createClient();

  const result = await supabase.from("profiles").update({ role }).eq("id", userId).select("id");
  ensureWriteSucceeded(result, MEMBERS_PATH);

  revalidatePath(MEMBERS_PATH);
}

export async function toggleBan(userId: string, isBanned: boolean) {
  const supabase = await createClient();

  const result = await supabase
    .from("profiles")
    .update({ is_banned: !isBanned })
    .eq("id", userId)
    .select("id");
  ensureWriteSucceeded(result, MEMBERS_PATH);

  revalidatePath(MEMBERS_PATH);
}
