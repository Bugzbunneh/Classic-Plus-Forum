import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MILESTONES, milestoneUnlockText } from "@/lib/achievements";
import { RoleBadge } from "@/components/role-badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: username };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role, created_at")
    .ilike("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: posts, count: postCount } = await supabase
    .from("posts")
    .select("id, title, slug, created_at, categories(slug)", { count: "exact" })
    .eq("author_id", profile.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(20);

  const { count: commentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profile.id)
    .eq("is_deleted", false);

  const totalActivity = (postCount ?? 0) + (commentCount ?? 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-charcoal-800" />
        )}
        <div>
          <h1 className="flex items-center text-xl font-semibold text-charcoal-200">
            {profile.display_name}
            <RoleBadge role={profile.role} className="ml-2" />
          </h1>
          <p className="text-sm text-charcoal-400">
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {profile.bio && (
        <p className="whitespace-pre-wrap text-sm text-charcoal-300">
          {profile.bio}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-charcoal-200">
          Achievements
        </h2>
        <div className="flex flex-wrap gap-2">
          {MILESTONES.map((milestone) => {
            const earned = totalActivity >= milestone.threshold;

            return (
              <div key={milestone.label} className="group relative">
                <span
                  className={`block w-fit rounded border px-2 py-1 text-xs font-medium ${
                    earned
                      ? milestone.colorClass
                      : "border-charcoal-700 text-charcoal-600"
                  }`}
                >
                  {milestone.label}
                </span>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-48 -translate-x-1/2 rounded border border-charcoal-600 bg-charcoal-950 px-2 py-1 text-center text-xs text-charcoal-200 shadow-lg group-hover:block">
                  {milestoneUnlockText(milestone, totalActivity)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-charcoal-200">
          Recent posts
        </h2>
        <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
          {posts?.length ? (
            posts.map((post) => (
              <li key={post.id} className="p-4 hover:bg-charcoal-800">
                <Link
                  href={`/c/${post.categories?.slug}/${post.slug}`}
                  className="block"
                >
                  <span className="font-medium text-green-400">
                    {post.title}
                  </span>
                  <p className="text-sm text-charcoal-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))
          ) : (
            <li className="p-4 text-sm text-charcoal-500">No posts yet.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
