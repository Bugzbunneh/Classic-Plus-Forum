import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalendarDays, MessageSquare, ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MILESTONES } from "@/lib/achievements";
import { staggerStyle } from "@/lib/stagger";
import { Avatar } from "@/components/avatar";
import { RoleBadge } from "@/components/role-badge";
import { AchievementTile } from "@/components/achievement-badge";
import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";

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

  // ilike for a case-insensitive match; escape its wildcards so /u/a% can't
  // match someone else's username.
  const usernamePattern = username.replace(/[\\%_]/g, "\\$&");
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role, created_at")
    .ilike("username", usernamePattern)
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
    <PageContainer>
      <section className="panel relative animate-rise-in overflow-hidden">
        {/* Banner strip behind the avatar. */}
        <div className="h-24 bg-[radial-gradient(ellipse_at_20%_0%,rgb(58_156_92/0.5),transparent_60%),radial-gradient(ellipse_at_90%_100%,rgb(201_161_59/0.35),transparent_60%)] bg-charcoal-900 sm:h-28" />

        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6 sm:pb-6">
          <div className="-mt-12 w-fit rounded-full bg-charcoal-900 p-1.5 sm:-mt-14">
            <Avatar url={profile.avatar_url} name={profile.display_name} size={96} role={profile.role} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="heading truncate text-2xl sm:text-3xl">{profile.display_name}</h1>
              <RoleBadge role={profile.role} />
            </div>
            <p className="flex items-center gap-1.5 text-sm text-charcoal-400">
              <CalendarDays className="size-4" aria-hidden="true" />
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <StatChip icon={<ScrollText className="size-4 text-gold-400" />} value={postCount ?? 0} label="threads" />
            <StatChip icon={<MessageSquare className="size-4 text-gold-400" />} value={commentCount ?? 0} label="replies" />
          </div>
        </div>

        {profile.bio && (
          <p className="border-t border-charcoal-700/60 px-5 py-4 text-sm whitespace-pre-wrap text-charcoal-300 sm:px-6">
            {profile.bio}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="heading flex items-center gap-3 text-lg">
          Achievements
          <span className="h-px flex-1 bg-linear-to-r from-gold-700/50 to-transparent" />
        </h2>
        <div className="flex flex-wrap gap-3">
          {MILESTONES.map((milestone, index) => (
            <AchievementTile
              key={milestone.label}
              milestone={milestone}
              totalActivity={totalActivity}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="heading flex items-center gap-3 text-lg">
          Recent threads
          <span className="h-px flex-1 bg-linear-to-r from-gold-700/50 to-transparent" />
        </h2>
        <ul className="panel flex flex-col overflow-hidden">
          {posts?.length ? (
            posts.map((post, index) => (
              <li
                key={post.id}
                className="group stagger animate-rise-in border-b border-charcoal-700/60 last:border-b-0"
                style={staggerStyle(index)}
              >
                <Link
                  href={`/c/${post.categories?.slug}/${post.slug}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/3"
                >
                  <span className="truncate font-semibold text-charcoal-100 transition-[color,transform] duration-300 ease-spring group-hover:translate-x-1 group-hover:text-green-300">
                    {post.title}
                  </span>
                  <span className="shrink-0 text-xs text-charcoal-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li>
              <EmptyState title="No threads yet" description={`${profile.display_name} hasn't started any threads.`} />
            </li>
          )}
        </ul>
      </section>
    </PageContainer>
  );
}

function StatChip({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-charcoal-700 bg-charcoal-950/60 px-4 py-2">
      <span className="flex items-center gap-1.5 text-lg font-bold text-charcoal-100">
        {icon}
        {value}
      </span>
      <span className="text-xs text-charcoal-500">{label}</span>
    </div>
  );
}
