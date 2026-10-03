import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Lock, MessageSquare, Pin, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { getPageRange, getTotalPages } from "@/lib/pagination";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { categoryIcon } from "@/lib/category-icons";
import { staggerStyle } from "@/lib/stagger";
import type { Role } from "@/lib/roles";
import { Avatar } from "@/components/avatar";
import { Pagination } from "@/components/pagination";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const POSTS_PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);

  return {
    title: category?.name ?? "Category",
    description: category?.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const category = await getCategoryBySlug(supabase, slug);
  if (!category) {
    notFound();
  }

  const { page, from, to } = getPageRange(pageParam, POSTS_PER_PAGE);

  const { data: posts, count } = await supabase
    .from("posts")
    .select(
      "id, title, slug, is_pinned, is_locked, created_at, profiles(username, display_name, avatar_url, role)",
      { count: "exact" },
    )
    .eq("category_id", category.id)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = getTotalPages(count, POSTS_PER_PAGE);

  const postIds = posts?.map((p) => p.id) ?? [];
  const { data: replyStats } = postIds.length
    ? await supabase
        .from("post_reply_stats")
        .select("post_id, reply_count, last_reply_at")
        .in("post_id", postIds)
    : { data: [] };

  const replyStatsByPost = new Map((replyStats ?? []).map((stats) => [stats.post_id, stats]));

  return (
    <PageContainer>
      <Link href="/" className="group flex w-fit items-center gap-1.5 text-sm text-charcoal-400 transition-colors hover:text-gold-300">
        <ArrowLeft className="size-4 transition-transform duration-300 ease-spring group-hover:-translate-x-1" />
        All categories
      </Link>

      <PageHeader
        icon={categoryIcon(slug)}
        title={category.name}
        description={category.description}
        actions={
          profile && (
            <Link href={`/c/${slug}/new`} className="group btn btn-primary">
              <Plus className="size-4 transition-transform duration-300 ease-spring group-hover:rotate-90" />
              New thread
            </Link>
          )
        }
      />

      <ul className="panel flex flex-col overflow-hidden">
        {posts?.length ? (
          posts.map((post, index) => {
            const stats = replyStatsByPost.get(post.id);

            return (
              <ThreadRow
                key={post.id}
                href={`/c/${slug}/${post.slug}`}
                title={post.title}
                isPinned={post.is_pinned}
                isLocked={post.is_locked}
                createdAt={post.created_at}
                author={post.profiles}
                replyCount={stats?.reply_count ?? 0}
                lastActivityAt={stats?.last_reply_at ?? post.created_at}
                index={index}
              />
            );
          })
        ) : (
          <li>
            <EmptyState
              title="No threads yet"
              description="Gather round the campfire and start the first conversation."
            />
          </li>
        )}
      </ul>

      <Pagination page={page} totalPages={totalPages} basePath={`/c/${slug}`} />
    </PageContainer>
  );
}

function ThreadRow({
  href,
  title,
  isPinned,
  isLocked,
  createdAt,
  author,
  replyCount,
  lastActivityAt,
  index,
}: {
  href: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  author: { username: string; display_name: string; avatar_url: string | null; role: Role } | null;
  replyCount: number;
  lastActivityAt: string;
  index: number;
}) {
  const accentClass = isPinned ? "bg-gold-400" : "bg-green-500";

  return (
    <li
      className="group stagger relative flex animate-rise-in items-center gap-3 border-b border-charcoal-700/60 px-4 py-3.5 transition-colors duration-200 last:border-b-0 hover:bg-white/3 sm:gap-4 sm:px-5"
      style={staggerStyle(index)}
    >
      {/* Accent bar that grows in from the left edge on hover. */}
      <span
        className={`absolute inset-y-2 left-0 w-0.5 origin-center scale-y-0 rounded-full transition-transform duration-300 ease-spring group-hover:scale-y-100 ${accentClass}`}
      />

      <Avatar
        url={author?.avatar_url}
        name={author?.display_name ?? "?"}
        size={36}
        role={author?.role}
      />

      <div className="min-w-0 flex-1 transition-transform duration-300 ease-spring group-hover:translate-x-1">
        <div className="flex items-center gap-2">
          {isPinned && <Pin className="size-3.5 shrink-0 text-gold-400" aria-label="Pinned" />}
          {isLocked && <Lock className="size-3.5 shrink-0 text-charcoal-500" aria-label="Locked" />}
          <Link
            href={href}
            className={`truncate font-semibold transition-colors after:absolute after:inset-0 ${
              isPinned ? "text-gold-300 group-hover:text-gold-300" : "text-charcoal-100 group-hover:text-green-300"
            }`}
          >
            {title}
          </Link>
        </div>
        <p className="mt-0.5 truncate text-xs text-charcoal-500">
          by{" "}
          {author?.username ? (
            <Link href={`/u/${author.username}`} className="relative z-10 text-charcoal-400 hover:text-gold-300">
              {author.display_name}
            </Link>
          ) : (
            "Unknown"
          )}{" "}
          · {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-charcoal-500">
        <span className="flex items-center gap-1 text-charcoal-300">
          <MessageSquare className="size-3.5" aria-hidden="true" />
          {replyCount}
          <span className="sr-only">{replyCount === 1 ? "reply" : "replies"}</span>
        </span>
        <span>{formatRelativeTime(new Date(lastActivityAt))}</span>
      </div>
    </li>
  );
}
