import Link from "next/link";
import { MessagesSquare, ScrollText, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { getCategoryActivitySummaries, type CategoryActivity } from "@/lib/queries/categories";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { categoryIcon } from "@/lib/category-icons";
import { staggerStyle } from "@/lib/stagger";
import { GameIcon } from "@/components/game-icon";
import { IconTile } from "@/components/icon-tile";
import { PageContainer } from "@/components/page-container";

export default async function Home() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, name, categories(id, name, slug, description)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "categories" });

  const categoryActivity = await getCategoryActivitySummaries(supabase);
  const { count: memberCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const allActivity = [...categoryActivity.values()];
  const totalThreads = allActivity.reduce((sum, activity) => sum + activity.threadCount, 0);
  const totalPosts = allActivity.reduce((sum, activity) => sum + activity.totalPostCount, 0);

  return (
    <PageContainer width="wide" className="gap-10">
      <Hero
        welcomeName={profile?.display_name}
        memberCount={memberCount ?? 0}
        threadCount={totalThreads}
        postCount={totalPosts}
      />

      {sections?.map((section) => (
        <section key={section.id} className="flex flex-col gap-4">
          <h2 className="heading flex items-center gap-3 text-sm tracking-[0.25em] text-gold-400 uppercase">
            {section.name}
            <span className="h-px flex-1 bg-linear-to-r from-gold-700/60 to-transparent" />
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {section.categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                activity={categoryActivity.get(category.id)}
                index={index}
              />
            ))}
          </div>
        </section>
      ))}
    </PageContainer>
  );
}

function Hero({
  welcomeName,
  memberCount,
  threadCount,
  postCount,
}: {
  welcomeName: string | undefined;
  memberCount: number;
  threadCount: number;
  postCount: number;
}) {
  return (
    <section className="panel relative animate-rise-in overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
      {/* Atmosphere: fel-green mist bottom-left, gold glow top-right, and a big faint emblem. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_110%,rgb(58_156_92/0.35),transparent_55%),radial-gradient(ellipse_at_95%_-10%,rgb(201_161_59/0.25),transparent_50%)]"
      />
      <GameIcon
        name="crossed-swords"
        className="pointer-events-none absolute -right-10 -bottom-12 size-72 rotate-12 animate-float text-gold-400/7 sm:right-6 sm:size-80"
      />

      <div className="relative flex flex-col gap-5">
        <p className="text-xs font-semibold tracking-[0.3em] text-green-400 uppercase">
          World of Warcraft: Forever
        </p>
        <h1 className="heading text-gold-gradient text-4xl drop-shadow-[0_2px_12px_rgb(224_189_94/0.25)] sm:text-6xl">
          Classic Plus
        </h1>
        <p className="max-w-lg text-charcoal-300 sm:text-lg">
          {welcomeName
            ? `Welcome back, ${welcomeName}. The hearth is warm and the tavern's open.`
            : "The guild hall for raid nights, class talk, and tall tales from Azeroth."}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="chip">
            <Users className="size-3.5 text-gold-400" aria-hidden="true" />
            <strong className="text-charcoal-100">{memberCount}</strong> {memberCount === 1 ? "member" : "members"}
          </span>
          <span className="chip">
            <ScrollText className="size-3.5 text-gold-400" aria-hidden="true" />
            <strong className="text-charcoal-100">{threadCount}</strong> {threadCount === 1 ? "thread" : "threads"}
          </span>
          <span className="chip">
            <MessagesSquare className="size-3.5 text-gold-400" aria-hidden="true" />
            <strong className="text-charcoal-100">{postCount}</strong> {postCount === 1 ? "post" : "posts"}
          </span>
        </div>

        {!welcomeName && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/signup" className="btn btn-primary">
              Join the guild
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Log in
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  activity,
  index,
}: {
  category: { id: string; name: string; slug: string; description: string | null };
  activity: CategoryActivity | undefined;
  index: number;
}) {
  const threadCount = activity?.threadCount ?? 0;
  const totalPostCount = activity?.totalPostCount ?? 0;
  const lastActivity = activity?.lastActivity ?? null;

  return (
    <article
      className="panel panel-interactive group stagger relative flex min-w-0 animate-rise-in flex-col gap-4 p-5"
      style={staggerStyle(index)}
    >
      <div className="flex items-start gap-4">
        <IconTile name={categoryIcon(category.slug)} />
        <div className="min-w-0 flex-1">
          {/* Stretched link: the whole card is clickable, except the inner "latest" link. */}
          <Link
            href={`/c/${category.slug}`}
            className="font-semibold text-charcoal-100 transition-colors after:absolute after:inset-0 after:rounded-xl group-hover:text-gold-300"
          >
            {category.name}
          </Link>
          {category.description && (
            <p className="mt-0.5 text-sm text-charcoal-400">{category.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="chip">
          <strong className="text-charcoal-100">{threadCount}</strong>
          {threadCount === 1 ? "thread" : "threads"}
        </span>
        <span className="chip">
          <strong className="text-charcoal-100">{totalPostCount}</strong>
          {totalPostCount === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="mt-auto border-t border-charcoal-700/60 pt-3 text-sm">
        {lastActivity ? (
          <p className="truncate text-charcoal-400">
            <span className="text-charcoal-500">Latest: </span>
            <Link
              href={`/c/${category.slug}/${lastActivity.postSlug}`}
              className="relative z-10 text-green-400 transition-colors hover:text-green-300 hover:underline"
            >
              {lastActivity.postTitle}
            </Link>
            <span className="text-charcoal-500">
              {" "}
              · {lastActivity.authorName} · {formatRelativeTime(new Date(lastActivity.createdAt))}
            </span>
          </p>
        ) : (
          <p className="text-charcoal-500 italic">No activity yet. Be the first to post.</p>
        )}
      </div>
    </article>
  );
}
