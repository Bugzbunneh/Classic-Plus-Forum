import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isModerator } from "@/lib/roles";

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role")
    .eq("id", user.id)
    .single();

  return profile;
});

/**
 * Like getCurrentProfile, but redirects to /login (bouncing back to
 * `nextPath` after signing in) instead of returning null. Use this wherever
 * a page or action requires the visitor to be signed in.
 */
export async function requireProfile(nextPath?: string) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }

  return profile;
}

/**
 * Like requireProfile, but also redirects home if the signed-in user isn't
 * an admin or owner. Use this for pages that are moderator-only, such as
 * everything under /admin.
 */
export async function requireModerator() {
  const profile = await requireProfile();

  if (!isModerator(profile.role)) {
    redirect("/");
  }

  return profile;
}
