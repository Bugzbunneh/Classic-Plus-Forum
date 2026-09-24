import type { Database } from "@/lib/supabase/types";

export type Role = Database["public"]["Enums"]["user_role"];

export function isModerator(role: Role | null | undefined): boolean {
  return role === "admin" || role === "owner";
}
